import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import IconTile from '../ui/IconTile';

export default function WhyKisanMandiSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Tractor,
      tone: 'green',
      title: t('home.why_card1_title'),
      desc: t('home.why_card1_desc'),
    },
    {
      icon: TrendingUp,
      tone: 'yellow',
      title: t('home.why_card2_title'),
      desc: t('home.why_card2_desc'),
    },
    {
      icon: ShieldCheck,
      tone: 'blue',
      title: t('home.why_card3_title'),
      desc: t('home.why_card3_desc'),
    },
    {
      icon: MapPin,
      tone: 'green',
      title: t('home.why_card4_title'),
      desc: t('home.why_card4_desc'),
    },
    {
      icon: Clock,
      tone: 'blue',
      title: t('home.why_card5_title'),
      desc: t('home.why_card5_desc'),
    },
    {
      icon: Star,
      tone: 'yellow',
      title: t('home.why_card6_title'),
      desc: t('home.why_card6_desc'),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-200/60">
      <div className="page-container">
        <SectionHeader
          eyebrow={t('home.why_eyebrow')}
          title={t('home.why_title')}
          subtitle={t('home.why_subtitle')}
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const FeatureIcon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-warm-50 rounded-2xl p-6 border border-neutral-200/70 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <div className="mb-4">
                    <IconTile icon={FeatureIcon} tone={feature.tone} size="md" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
