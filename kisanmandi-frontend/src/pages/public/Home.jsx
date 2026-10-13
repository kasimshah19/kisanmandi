import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { checkHealth } from '../../services/healthService';
import { mandiService } from '../../services/mandiService';
import { formatPrice } from '../../utils/format';
import { ShoppingBag, TrendingUp, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Home() {
  const { t } = useTranslation();
  useDocumentTitle('Fresh Produce & Mandi Rates | KisanMandi');

  const [health, setHealth] = useState({ status: 'LOADING...', database: 'LOADING...' });
  const [rates, setRates] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealth({ status: data.status, database: data.database });
      } catch {
        setHealth({ status: 'ERROR', database: 'ERROR' });
      }
    };
    fetchHealth();

    const fetchRates = async () => {
      const topCommodities = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soyabean'];
      const fetchedRates = [];
      for (const commodity of topCommodities) {
        try {
          const res = await mandiService.getSummary({ commodity });
          if (res.status === 200 && res.data) {
            fetchedRates.push(res.data);
          }
        } catch {
          // tolerate failure silently
        }
      }
      setRates(fetchedRates);
    };
    fetchRates();
  }, []);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-green-100 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-200/60 text-green-800 rounded-full text-xs font-semibold tracking-wide">
          <Sparkles size={14} /> {t('home.hero_badge')}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {t('home.hero_title')} <br className="hidden sm:inline" />
          <span className="text-green-700">{t('home.hero_title_highlight')}</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          {t('home.hero_subtitle')}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition active:scale-[0.99] min-h-[48px]"
          >
            <ShoppingBag size={18} />
            <span>{t('home.browse_produce_btn')}</span>
          </Link>
          <Link
            to="/mandi"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-800 font-semibold px-6 py-3 rounded-xl border border-green-200 shadow-sm transition active:scale-[0.99] min-h-[48px]"
          >
            <TrendingUp size={18} />
            <span>{t('home.view_mandi_rates_btn')}</span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t('home.direct_from_farmers')}</h2>
          <p className="text-sm text-gray-600">
            {t('home.step2_desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t('nav.mandi_rates')}</h2>
          <p className="text-sm text-gray-600">
            {t('mandi.subtitle')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t('products.verified')}</h2>
          <p className="text-sm text-gray-600">
            {t('home.verified_sellers')}
          </p>
        </div>
      </section>

      {/* Today's Mandi Rates Strip */}
      {rates.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('mandi.title')}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{t('mandi.data_source_note')}</p>
            </div>
            <Link to="/mandi" className="text-green-700 font-semibold hover:underline text-sm inline-flex items-center gap-1">
              <span>{t('common.view_all')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin">
            {rates.map((rate) => (
              <div
                key={rate.commodity}
                className="min-w-[170px] bg-green-50/80 border border-green-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-xs"
              >
                <span className="font-semibold text-gray-900 mb-1">{rate.commodity}</span>
                <span className="text-green-800 font-extrabold text-xl">₹{formatPrice(rate.avgModalPrice)}</span>
                <span className="text-xs text-gray-500 mt-1">/ {t('units.QUINTAL')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Backend Status Card */}
      <section className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-sm">
          <h2 className="text-base font-semibold mb-3 text-gray-900">System Live Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-gray-600">Backend API:</span>
              <span className={`font-semibold ${health.status === 'UP' ? 'text-green-700' : 'text-red-600'}`}>
                {health.status === 'UP' ? 'Online (Render)' : health.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">Database:</span>
              <span className={`font-semibold ${health.database === 'CONNECTED' ? 'text-green-700' : 'text-red-600'}`}>
                {health.database === 'CONNECTED' ? 'Connected (MySQL)' : health.database}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
