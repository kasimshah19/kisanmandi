import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Accordion from '../../components/ui/Accordion';
import {
  ShoppingBag,
  Leaf,
  CheckCircle2,
  TrendingUp,
  Volume2,
  Phone,
  HelpCircle,
  Truck,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  FarmerDirectIllustration,
  MandiMarketIllustration,
  CashOnDeliveryIllustration,
} from '../../components/illustrations/FarmerVisuals';

export default function Help() {
  useDocumentTitle('Help & Guides | KisanMandi');
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('customer');

  const customerSteps = [
    {
      num: '1',
      icon: '🍅',
      title: t('help.cust_step_1_title', '1. Choose Fresh Harvest'),
      desc: t('help.cust_step_1_desc', 'Browse by vegetables, fruits, or grains using large visual category tiles. Filter by distance to find farmers nearest to you.'),
    },
    {
      num: '2',
      icon: '📈',
      title: t('help.cust_step_2_title', '2. Verify Fair Mandi Rate'),
      desc: t('help.cust_step_2_desc', 'Every product shows transparent pricing benchmarked against daily official Agmarknet wholesale rates. No inflated supermarket markups.'),
    },
    {
      num: '3',
      icon: '🛒',
      title: t('help.cust_step_3_title', '3. Add to Cart & Enter Address'),
      desc: t('help.cust_step_3_desc', 'Select how many kilos you need and enter your doorstep delivery location. No complicated digital payment needed.'),
    },
    {
      num: '4',
      icon: '💵',
      title: t('help.cust_step_4_title', '4. Pay Cash at Doorstep'),
      desc: t('help.cust_step_4_desc', 'Receive farm-fresh produce directly from the grower. Inspect the harvest first, then pay in cash (100% Cash on Delivery).'),
    },
  ];

  const farmerSteps = [
    {
      num: '1',
      icon: '🧑‍🌾',
      title: t('help.farmer_step_1_title', '1. Register in 1 Minute'),
      desc: t('help.farmer_step_1_desc', 'Create your free farmer profile using your mobile number and district in Maharashtra. Verified by admin for trustworthiness.'),
    },
    {
      num: '2',
      icon: '📸',
      title: t('help.farmer_step_2_title', '2. Post Your Crop in 3 Questions'),
      desc: t('help.farmer_step_2_desc', 'Snap a photo of your vegetables or grain, enter the available quantity (in kg or quintal), and set your desired selling price.'),
    },
    {
      num: '3',
      icon: '📦',
      title: t('help.farmer_step_3_title', '3. Receive Customer Orders'),
      desc: t('help.farmer_step_3_desc', 'Get direct order requests from conscious households and local buyers in your area. Zero middleman cuts or dalal fees.'),
    },
    {
      num: '4',
      icon: '🤝',
      title: t('help.farmer_step_4_title', '4. Handover & Collect Cash'),
      desc: t('help.farmer_step_4_desc', 'Hand over your produce at the agreed delivery point and collect full 100% cash payment on the spot.'),
    },
  ];

  const faqItems = [
    {
      id: 'faq-cod',
      title: t('help.faq_cod_q', 'How do payments work? Do I need online banking?'),
      content: t('help.faq_cod_a', 'No online banking or card is needed! KisanMandi operates on 100% Cash on Delivery (COD). You only pay cash after the produce arrives at your doorstep.'),
    },
    {
      id: 'faq-voice',
      title: t('help.faq_voice_q', 'How does the "Listen / सुनें" button work?'),
      content: t('help.faq_voice_a', 'On modern phones, tapping the 🔊 "Listen" button reads today\'s mandi prices or product details out loud in Hindi, Marathi, or English. It helps users who prefer listening over reading.'),
    },
    {
      id: 'faq-text-size',
      title: t('help.faq_size_q', 'Can I make the text bigger if I have trouble reading?'),
      content: t('help.faq_size_a', 'Yes! Tap the "A / A+ / A++" button in the top navigation bar to enlarge the text across the entire application instantly.'),
    },
    {
      id: 'faq-mandi-source',
      title: t('help.faq_mandi_q', 'Where do the Mandi rates come from?'),
      content: t('help.faq_mandi_a', 'Wholesale mandi rates are synced daily from the official Government Agmarknet portal via data.gov.in (Open Government Data). They reflect real market modal rates across Maharashtra APMCs.'),
    },
    {
      id: 'faq-registration',
      title: t('help.faq_reg_q', 'Is registration free for farmers?'),
      content: t('help.faq_reg_a', 'Yes, KisanMandi is 100% free for farmers. There are no registration fees, listing fees, or commission deductions on your sales.'),
    },
  ];

  return (
    <div className="w-full pb-16">
      <PageHeader
        breadcrumbs={[
          { label: t('nav.home', 'Home'), to: '/' },
          { label: t('nav.help', 'Help') },
        ]}
        title={t('help.page_title', 'Help & How-To Guides')}
        subtitle={t(
          'help.page_subtitle',
          'Easy step-by-step guides for farmers and customers. Learn how to order, sell, and check mandi rates.'
        )}
      />

      <div className="page-container mt-8 space-y-12">
        {/* Toggle between Customer and Farmer Guides */}
        <section aria-labelledby="guide-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h2 id="guide-heading" className="text-2xl font-bold text-gray-900">
                4-Step Visual Guides
              </h2>
              <p className="text-sm text-gray-600">
                Simple, straightforward instructions with zero complicated jargon.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'customer'}
                onClick={() => setActiveTab('customer')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                  activeTab === 'customer'
                    ? 'bg-white text-green-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingBag size={16} />
                <span>How to Order (खरीदें)</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'farmer'}
                onClick={() => setActiveTab('farmer')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                  activeTab === 'farmer'
                    ? 'bg-white text-green-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Leaf size={16} />
                <span>How to Sell (बेचें)</span>
              </button>
            </div>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'customer' ? customerSteps : farmerSteps).map((step) => (
              <Card key={step.num} hover className="p-6 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl" role="img" aria-hidden="true">
                      {step.icon}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-extrabold text-sm flex items-center justify-center">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Banner matching active tab */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-green-950 text-base">
                {activeTab === 'customer'
                  ? 'Ready to order fresh harvest directly from a nearby farmer?'
                  : 'Are you a farmer in Maharashtra? Start selling today.'}
              </h4>
              <p className="text-xs sm:text-sm text-green-800">
                {activeTab === 'customer'
                  ? 'Browse verified harvests with 100% Cash on Delivery.'
                  : 'Zero dalal fees, 100% direct cash in your pocket.'}
              </p>
            </div>

            <Button
              as={Link}
              to={activeTab === 'customer' ? '/products' : '/register?role=FARMER'}
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              className="shrink-0 w-full sm:w-auto"
            >
              {activeTab === 'customer' ? 'Browse Produce Now' : 'Join as Farmer'}
            </Button>
          </div>
        </section>

        {/* Understanding Mandi Rates Section */}
        <section aria-labelledby="mandi-guide-heading" className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-card space-y-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <TrendingUp size={14} />
                <span>Mandi Rate Guide (मंडी भाव समझना)</span>
              </div>
              <h2 id="mandi-guide-heading" className="text-2xl font-bold text-gray-900 leading-tight">
                How to understand daily wholesale Mandi prices
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Wholesale prices in government APMC mandis are quoted per quintal (1 quintal = 100 kg).
                Here is what the terms mean:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-green-700 text-sm shrink-0">Most Common Price (Modal):</span>
                  <span className="text-xs sm:text-sm text-gray-600">The rate at which the majority of produce traded today. This is the most reliable baseline rate.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-amber-700 text-sm shrink-0">Lowest & Highest (Min / Max):</span>
                  <span className="text-xs sm:text-sm text-gray-600">The lowest quality sale price and the highest premium quality sale price recorded in the mandi.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-blue-700 text-sm shrink-0">Quintal to Kg:</span>
                  <span className="text-xs sm:text-sm text-gray-600">Divide the quintal price by 100. For example, ₹2,500/quintal = ₹25/kg.</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 flex justify-center">
              <MandiMarketIllustration className="w-full max-w-sm" />
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section aria-labelledby="faq-heading" className="space-y-4">
          <div className="space-y-1">
            <h2 id="faq-heading" className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions (अक्सर पूछे जाने वाले सवाल)
            </h2>
            <p className="text-sm text-gray-600">
              Clear answers in everyday language.
            </p>
          </div>

          <Card className="p-6">
            <Accordion items={faqItems} allowMultiple />
          </Card>
        </section>

        {/* Contact Support Reassurance */}
        <section aria-labelledby="contact-heading" className="bg-[#052e16] text-white rounded-3xl p-6 sm:p-10 shadow-lg text-center space-y-4">
          <h2 id="contact-heading" className="text-xl sm:text-2xl font-bold">
            Still have questions or need assistance?
          </h2>
          <p className="text-xs sm:text-sm text-green-100/80 max-w-xl mx-auto leading-relaxed">
            KisanMandi is built to support every farmer and household in Maharashtra.
            Feel free to explore the marketplace or view live market rates.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Button as={Link} to="/mandi" variant="harvest" size="lg">
              Check Mandi Rates
            </Button>
            <Button as={Link} to="/products" variant="secondary" size="lg">
              Buy Fresh Produce
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
