import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, LogIn } from 'lucide-react';
import Button from '../ui/Button';

export default function FarmerCtaSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-warm-50 border-b border-neutral-200/60">
      <div className="page-container">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b] text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-lg border border-green-800/40">
          {/* Subtle decorative glow & leaf overlay */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
            <div
              className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-400/10 blur-3xl rounded-full"
            />
            <div
              className="absolute -left-20 -top-20 w-80 h-80 bg-green-400/10 blur-3xl rounded-full"
            />
          </div>

          <div className="relative z-10 max-w-3xl">
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.18]">
              {t('home.cta_band_title')}
            </h2>

            {/* 3 Truthful check-mark bullets */}
            <ul className="space-y-3.5 mb-8 text-sm sm:text-base text-green-100/90">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-green-950 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span>{t('home.cta_bullet1')}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-green-950 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span>{t('home.cta_bullet2')}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-green-950 flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span>{t('home.cta_bullet3')}</span>
              </li>
            </ul>

            {/* Action buttons: Harvest Yellow button + ghost white */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                as={Link}
                to="/register?role=FARMER"
                size="lg"
                variant="harvest"
                rightIcon={<ArrowRight size={18} />}
                className="shadow-md"
              >
                {t('home.cta_register_btn')}
              </Button>
              <Button
                as={Link}
                to="/login"
                size="lg"
                variant="ghost"
                leftIcon={<LogIn size={18} />}
                className="text-white hover:bg-white/10 hover:text-white border border-white/20"
              >
                {t('home.cta_login_btn')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
