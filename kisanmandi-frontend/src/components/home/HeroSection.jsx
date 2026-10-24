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
  Check,
  Package,
  Truck,
  Home as HomeIcon,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatINR, unitLabel } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';

export default function HeroSection({ latestProduct, topMandi }) {
  const { t } = useTranslation();

  // Price formatting in whole rupees
  const mandiPriceFormatted = topMandi?.avgModal
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(topMandi.avgModal))
    : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50/70 via-emerald-50/30 to-warm-50 pt-8 pb-16 md:pt-14 md:pb-24 border-b border-neutral-200/60">
      {/* Background radial glow & faint organic dots/leaf pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-gradient-to-br from-green-300/25 to-amber-200/20 blur-3xl rounded-full"
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hero-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#15803d" />
              <path d="M16 12c2-3 5-3 7 0-2 3-5 3-7 0z" fill="#15803d" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline, Subtitle, CTAs, Trust chips */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2">
              <Badge tone="green" size="md" className="gap-1.5 shadow-2xs font-semibold">
                <Sparkles size={13} className="text-brand-700 animate-pulse" />
                <span>{t('home.hero_badge')}</span>
              </Badge>
            </div>

            {/* H1 Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.18] sm:leading-[1.12]">
              {t('home.hero_title')}{' '}
              <span className="relative inline-block text-brand-700">
                {t('home.hero_title_highlight')}
                {/* Hand-drawn style SVG underline */}
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

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('home.hero_subtitle')}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Button
                as={Link}
                to="/products"
                size="lg"
                variant="primary"
                leftIcon={<ShoppingBag size={18} />}
                className="w-full sm:w-auto shadow-md"
              >
                {t('home.browse_produce_btn')}
              </Button>
              <Button
                as={Link}
                to="/mandi"
                size="lg"
                variant="outline"
                leftIcon={<TrendingUp size={18} />}
                className="w-full sm:w-auto"
              >
                {t('home.view_mandi_rates_btn')}
              </Button>
            </div>

            {/* Farmer Sell Link with role preselect query */}
            <div className="pt-1">
              <Link
                to="/register?role=FARMER"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors group"
              >
                <span>{t('home.sell_cta_text')}</span>
              </Link>
            </div>

            {/* Trust Badges Row */}
            <div className="pt-4 border-t border-neutral-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left">
              <div className="min-w-0 flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-neutral-200/50 shadow-2xs">
                <CheckCircle2 size={15} className="text-brand-700 shrink-0" />
                <span className="text-xs font-medium text-neutral-800 truncate">{t('home.trust_verified')}</span>
              </div>
              <div className="min-w-0 flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-neutral-200/50 shadow-2xs">
                <Banknote size={15} className="text-brand-700 shrink-0" />
                <span className="text-xs font-medium text-neutral-800 truncate">{t('home.trust_cod')}</span>
              </div>
              <div className="min-w-0 flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-neutral-200/50 shadow-2xs">
                <Languages size={15} className="text-brand-700 shrink-0" />
                <span className="text-xs font-medium text-neutral-800 truncate">{t('home.trust_languages')}</span>
              </div>
              <div className="min-w-0 flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-neutral-200/50 shadow-2xs">
                <TrendingUp size={15} className="text-brand-700 shrink-0" />
                <span className="text-xs font-medium text-neutral-800 truncate">{t('home.trust_mandi')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Preview Cards (composed only from real data + neutral tracking) */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative w-full max-w-md mx-auto h-[440px] flex items-center justify-center">
              {/* Decorative background circle */}
              <div
                className="absolute inset-8 rounded-full bg-gradient-to-tr from-green-200/40 via-emerald-100/30 to-amber-100/40 blur-xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Card (a): Live Mandi Rate card (shown only when real data is available) */}
              {topMandi && mandiPriceFormatted && (
                <div className="absolute top-2 left-0 w-64 bg-white/95 backdrop-blur-xs rounded-2xl p-4 shadow-card border border-neutral-200/80 transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-20 motion-safe:animate-float">
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone="green" size="sm">
                      {t('home.preview_mandi_badge')}
                    </Badge>
                    <span className="text-[11px] text-neutral-500 tabular-nums">
                      {topMandi.arrivalDate || 'Today'}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 truncate">
                    {topMandi.commodity}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-extrabold text-brand-700">
                      ₹{mandiPriceFormatted}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">/ quintal</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Modal price</span>
                    <span className="text-brand-700 font-semibold inline-flex items-center gap-0.5">
                      Agmarknet <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              )}

              {/* Card (b): Newest Real Product mini card (shown only when real product exists) */}
              {latestProduct && (
                <div className="absolute bottom-4 left-4 w-60 bg-white rounded-2xl p-3 shadow-card border border-neutral-200/80 transform rotate-2 hover:rotate-0 transition-transform duration-300 z-30">
                  <div className="relative aspect-video rounded-xl bg-neutral-100 overflow-hidden mb-2">
                    {latestProduct.imageUrl ? (
                      <img
                        src={getOptimizedImageUrl(latestProduct.imageUrl, 300)}
                        alt={latestProduct.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                        {latestProduct.name}
                      </div>
                    )}
                    <span className="absolute top-1.5 left-1.5 bg-brand-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {t('home.preview_product_badge')}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-neutral-900 truncate">
                    {latestProduct.name}
                  </div>
                  <div className="text-xs text-brand-700 font-bold mt-0.5">
                    {formatINR(Number(latestProduct.pricePerUnit))}{' '}
                    <span className="text-[10px] text-neutral-500 font-normal">
                      / {unitLabel(latestProduct.unit)}
                    </span>
                  </div>
                  {latestProduct.farmName && (
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-1 truncate">
                      <MapPin size={10} className="shrink-0 text-neutral-400" />
                      <span className="truncate">
                        {latestProduct.farmName}
                        {latestProduct.village ? `, ${latestProduct.village}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card (c): Order Tracking illustration card (neutral 5 steps, zero fake names) */}
              <div className="absolute right-0 top-16 w-68 bg-white/95 backdrop-blur-xs rounded-2xl p-4 shadow-card border border-neutral-200/80 transform rotate-1 hover:rotate-0 transition-transform duration-300 z-10">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                    <Package size={14} className="text-brand-700" />
                    <span>{t('home.preview_order_title')}</span>
                  </div>
                  <Badge tone="yellow" size="sm">COD</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-brand-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span>{t('home.preview_step_placed')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span>{t('home.preview_step_accepted')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span>{t('home.preview_step_packed')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700 font-medium">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                      <Truck size={10} />
                    </span>
                    <span>{t('home.preview_step_shipped')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center text-[10px] font-bold">
                      <HomeIcon size={10} />
                    </span>
                    <span>{t('home.preview_step_delivered')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
