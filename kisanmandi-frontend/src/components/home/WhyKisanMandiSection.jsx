import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Clock,
  Languages,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

export default function WhyKisanMandiSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-200/60">
      <div className="page-container">
        <SectionHeader
          eyebrow={t('home.why_eyebrow', 'Built for Fairness')}
          title={t('home.why_title', 'Why KisanMandi?')}
          subtitle={t(
            'home.why_subtitle',
            'Built from the ground up to remove unfair trade barriers and honor real food producers.'
          )}
          align="center"
        />

        {/* Bento Grid: Mixed card spans on desktop, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mt-10">
          {/* Card 1: Direct from Farmers (Large Bento, 7 cols) */}
          <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-50/80 to-green-100/40 border border-emerald-200 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-xs">
                <Tractor size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2.5">
                {t('home.why_card1_title', 'Direct from Farmers')}
              </h3>
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-lg">
                {t(
                  'home.why_card1_desc',
                  'No intermediaries or long supply chains. Food travels directly from harvest to your home.'
                )}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span>100% Farm Fresh</span>
              <span>•</span>
              <span>Zero Middlemen</span>
            </div>
          </div>

          {/* Card 2: See Mandi Rates (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-50/80 to-yellow-100/40 border border-amber-200 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mb-5 shadow-xs">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2.5">
                {t('home.why_card2_title', 'See Mandi Rates First')}
              </h3>
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                {t(
                  'home.why_card2_desc',
                  'Mandi benchmarks displayed beside listings so buyers and growers both get genuine market value.'
                )}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <span>Official Agmarknet Rates</span>
            </div>
          </div>

          {/* Card 3: Verified Farmers (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-warm-50 border border-stone-200 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('home.why_card3_title', 'Verified Local Farmers')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t(
                  'home.why_card3_desc',
                  'Every seller submits official land or identity documents verified before listing crops.'
                )}
              </p>
            </div>
          </div>

          {/* Card 4: Farms Near You (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-warm-50 border border-stone-200 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('home.why_card4_title', 'Farms Near You')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t(
                  'home.why_card4_desc',
                  'Filter harvest by district or kilometer distance to buy the freshest food in your area.'
                )}
              </p>
            </div>
          </div>

          {/* Card 5: Track Every Order (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-warm-50 border border-stone-200 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('home.why_card5_title', 'Track Every Stage')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t(
                  'home.why_card5_desc',
                  'Stay updated from harvest acceptance to doorstep dispatch with transparent status tracking.'
                )}
              </p>
            </div>
          </div>

          {/* Card 6: Hindi, Marathi & Voice (12 cols full width bottom accent) */}
          <div className="lg:col-span-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-stone-900 to-green-950 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                <Languages size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  {t('home.why_card6_title', 'Hindi, Marathi & Audio Speech')}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                  {t(
                    'home.why_card6_desc',
                    'Switch between English, हिन्दी, and मराठी instantly. Tap the listen button anywhere to hear prices read aloud.'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-amber-300 border border-white/15">
                English
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-amber-300 border border-white/15">
                हिन्दी
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-amber-300 border border-white/15">
                मराठी
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
