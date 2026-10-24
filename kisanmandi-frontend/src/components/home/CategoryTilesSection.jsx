import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryTile, { CATEGORY_METADATA } from '../ui/CategoryTile';
import SectionHeader from '../ui/SectionHeader';

export default function CategoryTilesSection() {
  const { t } = useTranslation();

  const categories = [
    { key: 'VEGETABLES', name: t('categories.vegetables', 'Vegetables') },
    { key: 'FRUITS', name: t('categories.fruits', 'Fruits') },
    { key: 'GRAINS', name: t('categories.grains', 'Grains & Cereals') },
    { key: 'PULSES', name: t('categories.pulses', 'Pulses & Dal') },
    { key: 'DAIRY', name: t('categories.dairy', 'Dairy & Milk') },
    { key: 'ORGANIC', name: t('categories.organic', 'Organic & Herbs') },
  ];

  return (
    <section
      aria-labelledby="categories-section-heading"
      className="page-container py-10 sm:py-14"
    >
      <SectionHeader
        title={t('home.categories_title', 'Browse by Crop Category')}
        subtitle={t(
          'home.categories_subtitle',
          'Recognize by picture and tap to explore fresh local harvest'
        )}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
        {categories.map((cat) => (
          <CategoryTile
            key={cat.key}
            categoryKey={cat.key}
            name={cat.name}
            to={`/products?category=${cat.key}`}
          />
        ))}
      </div>
    </section>
  );
}
