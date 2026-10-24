import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import ProductCard from '../ProductCard';
import { SkeletonCard } from '../Skeleton';
import { productService } from '../../services/productService';

export default function FreshArrivalsSection({ onLatestProductLoaded }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFreshArrivals = async () => {
      try {
        const res = await productService.getPublicProducts({ size: 8, sort: 'newest' });
        if (!isMounted) return;

        const data = res.data;
        const list = Array.isArray(data) ? data : data?.content || [];
        setProducts(list);

        if (list.length > 0 && onLatestProductLoaded) {
          onLatestProductLoaded(list[0]);
        }
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFreshArrivals();

    return () => {
      isMounted = false;
    };
  }, [onLatestProductLoaded]);

  // If loading has finished and either error or 0 products returned, hide the entire section gracefully
  if (!isLoading && (hasError || products.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-warm-50 border-b border-neutral-200/60">
      <div className="page-container">
        <SectionHeader
          eyebrow={t('home.fresh_eyebrow')}
          title={t('home.fresh_title')}
          subtitle={t('home.fresh_subtitle')}
          action={
            <Button
              as={Link}
              to="/products"
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              className="hidden sm:inline-flex"
            >
              {t('home.fresh_view_all')}
            </Button>
          }
        />

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Product Cards Grid */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-8 text-center sm:hidden">
              <Button
                as={Link}
                to="/products"
                variant="outline"
                size="md"
                fullWidth
                rightIcon={<ArrowRight size={14} />}
              >
                {t('home.fresh_view_all')}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
