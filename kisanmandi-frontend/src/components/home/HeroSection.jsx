import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Banknote,
  Languages,
  Tractor,
  ArrowRight,
} from 'lucide-react';
import Badge from '../ui/Badge';
import HeroFarmScene from '../illustrations/HeroFarmScene';
import { getOptimizedImageUrl } from '../../utils/image';

/**
 * HeroSection v2
 * Left: Eyebrow, H1 with SVG underline, 2 large BigChoice-style role buttons,
 * text link to mandi rates, and 4 trust chips.
 * Right: HeroFarmScene in soft panel with 2 floating glass cards from REAL data only.
 * Bottom: Organic wave divider.
 */
export default function HeroSection({ latestProduct, topMandi }) {
  const { t } = useTranslation();

  // Format real mandi price in whole rupees
  const mandiPriceFormatted = topMandi?.avgModal
    ? Math.round(topMandi.avgModal).toLocaleString('en-IN')
    : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50/80 via-emerald-50/30 to-warm-50 pt-8 pb-14 md:pt-14 md:pb-20">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-br from-green-300/20 via-emerald-200/20 to-amber-200/15 blur-3xl rounded-full" />
      </div>

      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2">
              <Badge tone="green" size="md" className="gap-1.5 shadow-2xs font-bold text-xs sm:text-sm">
                <Sparkles size={14} className="text-brand-700 animate-pulse" />
                <span>{t('home.hero_badge', 'Direct Farm-to-Kitchen Marketplace')}</span>
              </Badge>
            </div>

            {/* H1 Heading with SVG Hand-Drawn Underline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.18] sm:leading-[1.12]">
              {t('home.hero_title', 'Fresh from the farm,')}{' '}
              <span className="relative inline-block text-brand-700">
                {t('home.hero_title_highlight', 'fair price for all.')}
                <svg
                  className="absolute -bottom-2 left-0 w-full text-amber-500/80 overflow-visible"
                  height="10"
                  viewBox="0 0 240 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 7C55 2 150 2 237 6"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Simple Subtitle */}
            <p className="text-base sm:text-lg text-neutral-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t(
                'home.hero_subtitle',
                'Buy directly from local farmers at transparent rates. No middlemen, fresher produce, better farmer income, plus live mandi rates.'
              )}
            </p>

            {/* TWO LARGE ROLE BUTTONS (BigChoice-style) */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0">
              {/* Buyer CTA */}
              <Link
                to="/products"
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-green-700 hover:bg-green-800 text-white shadow-card hover:shadow-card-hover transition-all duration-200 border-2 border-green-800 active:scale-[0.99] text-left focus-visible:ring-3 focus-visible:ring-green-600 outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-extrabold text-green-200">
                      Customer
                    </span>
                    <span className="block text-base sm:text-lg font-bold text-white leading-tight">
                      I want to BUY fresh produce
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-200 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              {/* Farmer CTA */}
              <Link
                to="/register?role=FARMER"
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-card hover:shadow-card-hover transition-all duration-200 border-2 border-amber-600 active:scale-[0.99] text-left focus-visible:ring-3 focus-visible:ring-amber-500 outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-950/15 flex items-center justify-center shrink-0 text-stone-950 group-hover:scale-105 transition-transform">
                    <Tractor className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-extrabold text-amber-950">
                      Farmer
                    </span>
                    <span className="block text-base sm:text-lg font-bold text-stone-950 leading-tight">
                      I want to SELL my crops
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-950 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

            {/* Smaller text link to Mandi Rates */}
            <div className="pt-1">
              <Link
                to="/mandi"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors group underline underline-offset-4 decoration-green-400"
              >
                <TrendingUp size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                <span>{t('home.view_mandi_rates_btn', "Check today's mandi rates")} →</span>
              </Link>
            </div>

            {/* Trust Badges Row (4 chips) */}
            <div className="pt-4 border-t border-neutral-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left">
              <div className="min-w-0 flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-neutral-200/70 shadow-2xs">
                <CheckCircle2 size={16} className="text-brand-700 shrink-0" />
                <span className="text-xs font-semibold text-neutral-800 truncate">
                  {t('home.trust_verified', 'Verified Farmers')}
                </span>
              </div>
              <div className="min-w-0 flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-neutral-200/70 shadow-2xs">
                <Banknote size={16} className="text-brand-700 shrink-0" />
                <span className="text-xs font-semibold text-neutral-800 truncate">
                  {t('home.trust_cod', 'Pay cash when you receive')}
                </span>
              </div>
              <div className="min-w-0 flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-neutral-200/70 shadow-2xs">
                <Languages size={16} className="text-brand-700 shrink-0" />
                <span className="text-xs font-semibold text-neutral-800 truncate">
                  {t('home.trust_languages', 'Hindi & Marathi')}
                </span>
              </div>
              <div className="min-w-0 flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-neutral-200/70 shadow-2xs">
                <TrendingUp size={16} className="text-brand-700 shrink-0" />
                <span className="text-xs font-semibold text-neutral-800 truncate">
                  {t('home.trust_mandi', 'Live Mandi Rates')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: HeroFarmScene Illustration with 2 Floating Glass Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full max-w-lg mx-auto bg-emerald-50/70 border-2 border-emerald-200/60 rounded-3xl p-4 sm:p-6 shadow-card">
              {/* Main Vector Farm Landscape Illustration */}
              <div className="w-full flex items-center justify-center">
                <HeroFarmScene className="w-full h-auto max-h-[340px]" />
              </div>

              {/* Floating Glass Card 1: Today's Mandi Rate (REAL DATA ONLY) */}
              {topMandi && mandiPriceFormatted && (
                <div className="absolute -top-3 -left-3 w-56 sm:w-64 bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-pop border border-white/80 motion-safe:animate-float z-20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      Live Mandi
                    </span>
                    <span className="text-[10px] text-stone-500 tabular-nums">
                      {topMandi.arrivalDate || 'Today'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {topMandi.commodity}
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-green-800 tabular-nums">
                      ₹{mandiPriceFormatted}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">/ quintal (100 kg)</span>
                  </div>
                  <div className="mt-1 pt-1 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                    <span>Most common price</span>
                    <span className="text-green-700 font-bold inline-flex items-center gap-0.5">
                      Agmarknet →
                    </span>
                  </div>
                </div>
              )}

              {/* Floating Glass Card 2: Newest Real Product (REAL DATA ONLY) */}
              {latestProduct && (
                <div className="absolute -bottom-3 -right-3 w-52 sm:w-60 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-pop border border-white/80 motion-safe:animate-float z-20 [animation-delay:1.5s]">
                  <div className="flex items-center gap-2.5">
                    {latestProduct.imageUrl ? (
                      <img
                        src={getOptimizedImageUrl(latestProduct.imageUrl, 120)}
                        alt={latestProduct.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">
                        🌱
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        Fresh Harvest
                      </span>
                      <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                        {latestProduct.name}
                      </p>
                      <p className="text-xs font-extrabold text-green-700 tabular-nums">
                        ₹{latestProduct.price} / {latestProduct.unit?.toLowerCase() || 'kg'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider at bottom */}
      <div className="w-full overflow-hidden leading-none -mb-1 mt-8" aria-hidden="true">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 text-white fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
