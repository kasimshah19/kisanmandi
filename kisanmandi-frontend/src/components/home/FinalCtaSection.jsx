import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';

export default function FinalCtaSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-warm-50 to-green-50/50 text-center">
      <div className="page-container max-w-3xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4 leading-tight">
          {t('home.final_cta_title')}
        </h2>
        <p className="text-base sm:text-lg text-neutral-600 mb-8 max-w-xl mx-auto leading-relaxed">
          {t('home.final_cta_subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            as={Link}
            to="/products"
            size="lg"
            variant="primary"
            leftIcon={<ShoppingBag size={18} />}
            className="w-full sm:w-auto shadow-md"
          >
            {t('home.final_cta_browse')}
          </Button>
          <Button
            as={Link}
            to="/mandi"
            size="lg"
            variant="outline"
            leftIcon={<TrendingUp size={18} />}
            className="w-full sm:w-auto"
          >
            {t('home.final_cta_mandi')}
          </Button>
        </div>
      </div>
    </section>
  );
}
