import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../ui/SectionHeader';
import Tabs from '../ui/Tabs';
import StepBrowse from '../illustrations/StepBrowse';
import StepOrder from '../illustrations/StepOrder';
import StepDeliver from '../illustrations/StepDeliver';
import StepSell from '../illustrations/StepSell';
import StepRate from '../illustrations/StepRate';

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buyers');

  const buyerSteps = [
    {
      num: 1,
      Illustration: StepBrowse,
      title: t('home.buyer_step1_title', 'Browse Nearby Farms'),
      desc: t('home.buyer_step1_desc', 'Pick fresh vegetables, fruits, and grains directly from nearby farms.'),
    },
    {
      num: 2,
      Illustration: StepOrder,
      title: t('home.buyer_step2_title', 'Order with Cash on Delivery'),
      desc: t('home.buyer_step2_desc', 'Confirm quantity and doorstep address. Pay cash on delivery.'),
    },
    {
      num: 3,
      Illustration: StepDeliver,
      title: t('home.buyer_step3_title', 'Track from Farm to Kitchen'),
      desc: t('home.buyer_step3_desc', 'Harvest travels straight from the field to your kitchen.'),
    },
    {
      num: 4,
      Illustration: StepRate,
      title: t('home.buyer_step4_title', 'Rate Your Farmer'),
      desc: t('home.buyer_step4_desc', 'Enjoy real freshness and support honest agricultural growers.'),
    },
  ];

  const farmerSteps = [
    {
      num: 1,
      Illustration: StepSell,
      title: t('home.farmer_step1_title', 'Register & Get Verified'),
      desc: t('home.farmer_step1_desc', 'Set your desired price and quantity in three simple questions.'),
    },
    {
      num: 2,
      Illustration: StepRate,
      title: t('home.farmer_step2_title', 'Benchmark with Live Mandi'),
      desc: t('home.farmer_step2_desc', 'Check live mandi market prices while setting your rates.'),
    },
    {
      num: 3,
      Illustration: StepDeliver,
      title: t('home.farmer_step3_title', 'Dispatch to Buyer'),
      desc: t('home.farmer_step3_desc', 'Coordinate delivery directly with local household buyers.'),
    },
    {
      num: 4,
      Illustration: StepOrder,
      title: t('home.farmer_step4_title', 'Receive Orders & Grow Income'),
      desc: t('home.farmer_step4_desc', 'Receive full cash on delivery with zero middleman deductions.'),
    },
  ];

  const currentSteps = activeTab === 'buyers' ? buyerSteps : farmerSteps;

  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-200/60">
      <div className="page-container">
        <SectionHeader
          eyebrow={t('home.how_eyebrow', 'Simple & Direct')}
          title={t('home.how_title', 'How KisanMandi Works')}
          subtitle={t(
            'home.how_subtitle',
            'A fair and transparent platform designed for both household buyers and hardworking farmers.'
          )}
          align="center"
        />

        {/* Accessible Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs
            tabs={[
              { id: 'buyers', label: t('home.tab_for_buyers', 'Buying Produce') },
              { id: 'farmers', label: t('home.tab_for_farmers', 'Selling Crops') },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* 4 Steps with connecting dotted line on desktop */}
        <div className="relative">
          {/* Dotted connecting line across steps on lg */}
          <div
            className="hidden lg:block absolute top-14 left-16 right-16 border-t-2 border-dashed border-emerald-300/80 -z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {currentSteps.map((step) => {
              const StepIllustration = step.Illustration;
              return (
                <div
                  key={step.num}
                  className="bg-warm-50 rounded-2xl p-6 border border-stone-200/80 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between text-center lg:text-left"
                >
                  <div>
                    {/* Top row: Number Badge + Spot Illustration */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-full bg-green-800 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                        {step.num}
                      </span>
                      <div className="w-16 h-16 flex items-center justify-center">
                        <StepIllustration className="w-16 h-16" />
                      </div>
                    </div>

                    {/* Step Title (Up to 4 words) */}
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2 leading-snug">
                      {step.title}
                    </h3>
                    {/* One short line */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
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
