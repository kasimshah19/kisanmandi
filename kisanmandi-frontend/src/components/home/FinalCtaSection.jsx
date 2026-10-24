import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Tractor, ArrowRight } from 'lucide-react';

export default function FinalCtaSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-warm-50 to-green-50/60 text-center border-t border-stone-200/60">
      <div className="page-container max-w-4xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-4 leading-tight">
          {t('home.final_cta_title', 'Ready to eat fresh?')}
        </h2>
        <p className="text-base sm:text-lg text-stone-600 mb-10 max-w-xl mx-auto leading-relaxed">
          {t(
            'home.final_cta_subtitle',
            'Connect with your local farming community today and enjoy fresh produce delivered with care.'
          )}
        </p>

        {/* Two Big Role Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          {/* Buyer CTA */}
          <Link
            to="/products"
            className="group relative flex items-center justify-between p-5 rounded-2xl bg-green-700 hover:bg-green-800 text-white shadow-card hover:shadow-card-hover transition-all duration-200 border-2 border-green-800 active:scale-[0.99] outline-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider font-extrabold text-green-200">
                  {t('auth.role_customer', 'Customer')}
                </span>
                <span className="block text-base sm:text-lg font-bold text-white leading-tight">
                  {t('home.role_buyer_btn', 'I want to BUY fresh produce')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-green-200 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0" />
          </Link>

          {/* Farmer CTA */}
          <Link
            to="/register?role=FARMER"
            className="group relative flex items-center justify-between p-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-card hover:shadow-card-hover transition-all duration-200 border-2 border-amber-600 active:scale-[0.99] outline-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-stone-950/15 flex items-center justify-center shrink-0 text-stone-950 group-hover:scale-105 transition-transform">
                <Tractor className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider font-extrabold text-stone-900">
                  {t('auth.role_farmer', 'Farmer')}
                </span>
                <span className="block text-base sm:text-lg font-bold text-stone-950 leading-tight">
                  {t('home.role_seller_btn', 'I want to SELL my crops')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-900 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
