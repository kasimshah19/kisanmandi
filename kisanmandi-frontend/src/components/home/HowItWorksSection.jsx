import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Banknote,
  Truck,
  Star,
  UserCheck,
  Tag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Tabs from '../ui/Tabs';
import IconTile from '../ui/IconTile';

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buyers');

  const buyerSteps = [
    {
      num: 1,
      icon: Search,
      tone: 'green',
      title: t('home.buyer_step1_title'),
      desc: t('home.buyer_step1_desc'),
    },
    {
      num: 2,
      icon: Banknote,
      tone: 'yellow',
      title: t('home.buyer_step2_title'),
      desc: t('home.buyer_step2_desc'),
    },
    {
      num: 3,
      icon: Truck,
      tone: 'blue',
      title: t('home.buyer_step3_title'),
      desc: t('home.buyer_step3_desc'),
    },
    {
      num: 4,
      icon: Star,
      tone: 'yellow',
      title: t('home.buyer_step4_title'),
      desc: t('home.buyer_step4_desc'),
    },
  ];

  const farmerSteps = [
    {
      num: 1,
      icon: UserCheck,
      tone: 'green',
      title: t('home.farmer_step1_title'),
      desc: t('home.farmer_step1_desc'),
    },
    {
      num: 2,
      icon: Tag,
      tone: 'green',
      title: t('home.farmer_step2_title'),
      desc: t('home.farmer_step2_desc'),
    },
    {
      num: 3,
      icon: TrendingUp,
      tone: 'yellow',
      title: t('home.farmer_step3_title'),
      desc: t('home.farmer_step3_desc'),
    },
    {
      num: 4,
      icon: Wallet,
      tone: 'blue',
      title: t('home.farmer_step4_title'),
      desc: t('home.farmer_step4_desc'),
    },
  ];

  const currentSteps = activeTab === 'buyers' ? buyerSteps : farmerSteps;

  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-200/60">
      <div className="page-container">
        <SectionHeader
          eyebrow={t('home.how_eyebrow')}
          title={t('home.how_title')}
          subtitle={t('home.how_subtitle')}
          align="center"
        />

        {/* Accessible Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs
            tabs={[
              { id: 'buyers', label: t('home.tab_for_buyers') },
              { id: 'farmers', label: t('home.tab_for_farmers') },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* 4 Steps with connecting line on desktop */}
        <div className="relative">
          {/* Thin connecting guide line across steps on lg */}
          <div
            className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-neutral-200/80 -z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {currentSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-warm-50 rounded-2xl p-6 border border-neutral-200/70 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Step Number + Icon Tile */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="w-8 h-8 rounded-full bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                        {step.num}
                      </span>
                      <IconTile icon={StepIcon} tone={step.tone} size="md" />
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-base font-bold text-neutral-900 mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
