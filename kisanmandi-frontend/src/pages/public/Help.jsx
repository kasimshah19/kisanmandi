import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import ListenButton from '../../components/ListenButton';
import { CONTACT_EMAIL } from '../../config/site';
import StepBrowse from '../../components/illustrations/StepBrowse';
import StepOrder from '../../components/illustrations/StepOrder';
import StepDeliver from '../../components/illustrations/StepDeliver';
import StepRate from '../../components/illustrations/StepRate';
import StepSell from '../../components/illustrations/StepSell';
import { Mail, ShoppingBag, Tractor, ArrowRight } from 'lucide-react';

export default function Help() {
  const { t } = useTranslation();
  useDocumentTitle('How to use KisanMandi | Help & Guides');
  const [activeTab, setActiveTab] = useState('buy');

  const buyerSteps = [
    {
      num: 1,
      Illustration: StepBrowse,
      title: t('help.cust_step_1_title', '1. Choose Fresh Harvest'),
      desc: t('help.cust_step_1_desc', 'Browse by vegetables, fruits, or grains using large visual category tiles. Filter by distance to find farmers nearest to you.'),
    },
    {
      num: 2,
      Illustration: StepOrder,
      title: t('help.cust_step_2_title', '2. Verify Fair Mandi Rate'),
      desc: t('help.cust_step_2_desc', 'Every product shows transparent pricing benchmarked against daily official Agmarknet wholesale rates. No inflated supermarket markups.'),
    },
    {
      num: 3,
      Illustration: StepDeliver,
      title: t('help.cust_step_3_title', '3. Add to Cart & Enter Address'),
      desc: t('help.cust_step_3_desc', 'Select how many kilos you need and enter your doorstep delivery location. No complicated digital payment needed.'),
    },
    {
      num: 4,
      Illustration: StepRate,
      title: t('help.cust_step_4_title', '4. Pay Cash at Doorstep'),
      desc: t('help.cust_step_4_desc', 'Receive farm-fresh produce directly from the grower. Inspect the harvest first, then pay in cash (100% Cash on Delivery).'),
    },
  ];

  const sellerSteps = [
    {
      num: 1,
      Illustration: StepSell,
      title: t('help.farmer_step_1_title', '1. Register in 1 Minute'),
      desc: t('help.farmer_step_1_desc', 'Create your free farmer profile using your mobile number and district in Maharashtra. Verified by admin for trustworthiness.'),
    },
    {
      num: 2,
      Illustration: StepRate,
      title: t('help.farmer_step_2_title', '2. Post Your Crop in 3 Questions'),
      desc: t('help.farmer_step_2_desc', 'Snap a photo of your vegetables or grain, enter the available quantity (in kg or quintal), and set your desired selling price.'),
    },
    {
      num: 3,
      Illustration: StepBrowse,
      title: t('help.farmer_step_3_title', '3. Receive Customer Orders'),
      desc: t('help.farmer_step_3_desc', 'Get direct order requests from conscious households and local buyers in your area. Zero middleman cuts or dalal fees.'),
    },
    {
      num: 4,
      Illustration: StepOrder,
      title: t('help.farmer_step_4_title', '4. Handover & Collect Cash'),
      desc: t('help.farmer_step_4_desc', 'Hand over your produce at the agreed delivery point and collect full 100% cash payment on the spot.'),
    },
  ];

  const currentSteps = activeTab === 'buy' ? buyerSteps : sellerSteps;

  return (
    <div className="w-full pb-16">
      <PageHeader
        breadcrumbs={[
          { label: t('nav.home', 'Home'), to: '/' },
          { label: t('nav.help', 'Help') },
        ]}
        title={t('help.page_title', 'How to use KisanMandi')}
        subtitle={t(
          'help.page_subtitle',
          'Simple, step-by-step guides for buyers and farmers. Learn how to order, sell, and check rates with ease.'
        )}
      />

      <div className="page-container max-w-4xl mt-8 space-y-10">
        {/* Buyer / Seller Accessible Tabs */}
        <div className="flex justify-center">
          <Tabs
            tabs={[
              { id: 'buy', label: t('help.tab_buy', 'I want to buy') },
              { id: 'sell', label: t('help.tab_sell', 'I want to sell') },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Vertical List of Big Numbered Cards */}
        <div className="space-y-5" role="region" aria-label="Step-by-step guide">
          {currentSteps.map((step) => {
            const StepIllustration = step.Illustration;
            const speechText = `${step.title}. ${step.desc}`;

            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-2xs hover:shadow-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                {/* Left: Number + Spot Illustration + Text */}
                <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                  {/* Number Badge */}
                  <span className="w-10 h-10 rounded-2xl bg-green-800 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs mt-1 sm:mt-0">
                    {step.num}
                  </span>

                  {/* Spot Illustration */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                    <StepIllustration className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>

                  {/* Title & Simple 1-2 lines */}
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Right: Listen Button */}
                <div className="self-end sm:self-center shrink-0">
                  <ListenButton
                    text={speechText}
                    size="sm"
                    variant="outline"
                    label={t('speech.listen', 'Listen')}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action for Selected Tab */}
        <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-extrabold text-stone-900 text-lg">
              {activeTab === 'buy'
                ? t('help.cta_buy_title', 'Ready to order farm fresh vegetables and fruit?')
                : t('help.cta_sell_title', 'Are you a farmer looking for direct buyers?')}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">
              {activeTab === 'buy'
                ? t('help.cta_buy_desc', 'Browse available harvests near you with 100% Cash on Delivery.')
                : t('help.cta_sell_desc', 'Register your farm in 1 minute and keep 100% of your crop profit.')}
            </p>
          </div>
          <Button
            as={Link}
            to={activeTab === 'buy' ? '/products' : '/register?role=FARMER'}
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={18} />}
            className="w-full sm:w-auto shrink-0"
          >
            {activeTab === 'buy'
              ? t('nav.browse', 'Buy Produce')
              : t('nav.register', 'Register as Farmer')}
          </Button>
        </div>

        {/* "Still stuck?" Section: Only show mailto button if CONTACT_EMAIL is configured */}
        <div className="rounded-3xl bg-warm-50 border border-stone-200/80 p-6 sm:p-8 text-center space-y-3">
          <h3 className="text-lg font-bold text-stone-900">
            {t('help.still_stuck_title', 'Still stuck?')}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {t(
              'help.still_stuck_desc',
              'We are here to help you get started, understand mandi prices, or answer any questions about the platform.'
            )}
          </p>

          {CONTACT_EMAIL && (
            <div className="pt-2">
              <Button
                as="a"
                href={`mailto:${CONTACT_EMAIL}?subject=KisanMandi%20Support%20Request`}
                variant="outline"
                size="md"
                leftIcon={<Mail size={16} />}
              >
                {t('help.contact_support', 'Email Support')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
