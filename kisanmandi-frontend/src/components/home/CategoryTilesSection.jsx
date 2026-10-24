import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import CategoryIcon from '../../utils/categoryIcons';
import { categoryService } from '../../services/categoryService';

export default function CategoryTilesSection() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (!isMounted) return;
        const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setCategories(list);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Gracefully hide section if API fails or returns no categories
  if (!isLoading && (hasError || categories.length === 0)) {
    return null;
  }

  return (
    <section
      aria-labelledby="categories-section-heading"
      className="page-container py-10 sm:py-14"
    >
      <SectionHeader
        eyebrow={t('home.categories_eyebrow', 'Fresh Harvest')}
        title={t('home.categories_title', 'Browse by Crop Category')}
        subtitle={t(
          'home.categories_subtitle',
          'Tap any category to explore verified farm produce near you'
        )}
      />

      {/* Skeletons with fixed min-h-[96px] */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="min-h-[96px] rounded-2xl p-4 bg-white border border-stone-200/80 animate-pulse flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-stone-200" />
              <div className="h-4 w-16 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Category Tiles Grid */}
      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.id}`}
              className="group min-h-[96px] rounded-2xl p-4 bg-white border border-stone-200/90 shadow-2xs hover:shadow-card hover:border-green-600/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2"
            >
              <CategoryIcon name={cat.name} size="md" className="group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-stone-900 text-sm group-hover:text-green-800 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
