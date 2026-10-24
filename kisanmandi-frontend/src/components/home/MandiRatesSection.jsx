import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import CommodityIcon from '../../utils/commodityIcons';
import ListenButton from '../ListenButton';
import { mandiService } from '../../services/mandiService';

const COMMODITIES = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soyabean', 'Cotton'];
const CACHE_KEY = 'kisanmandi_home_mandi_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default function MandiRatesSection({ onRatesLoaded }) {
  const { t, i18n } = useTranslation();
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check sessionStorage cache first to prevent hammering free tier
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          Date.now() - parsed.timestamp < CACHE_TTL_MS &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0
        ) {
          setRates(parsed.data);
          setIsLoading(false);
          if (onRatesLoaded) onRatesLoaded(parsed.data[0]);
          return;
        }
      }
    } catch {
      // sessionStorage read failure tolerated
    }

    // Parallel fetch with Promise.allSettled
    const fetchSummaries = async () => {
      try {
        const promises = COMMODITIES.map((commodity) =>
          mandiService.getSummary({ commodity })
        );
        const settled = await Promise.allSettled(promises);
        if (!isMounted) return;

        const validRates = [];
        settled.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.status === 200 && res.value?.data) {
            validRates.push(res.value.data);
          }
        });

        setRates(validRates);
        if (validRates.length > 0 && onRatesLoaded) {
          onRatesLoaded(validRates[0]);
        }

        // Cache successful responses in sessionStorage
        if (validRates.length > 0) {
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), data: validRates })
            );
          } catch {
            // sessionStorage write failure tolerated
          }
        }
      } catch {
        // Silently tolerate network/server errors
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSummaries();

    return () => {
      isMounted = false;
    };
  }, [onRatesLoaded]);

  // Format price in whole rupees without decimals
  const formatWholeRupees = (val) => {
    if (!val && val !== 0) return '—';
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(val));
  };

  // Approx per kg price (quintal / 100)
  const formatPerKg = (val) => {
    if (!val && val !== 0) return null;
    return (val / 100).toFixed(1);
  };

  // Generate natural speech sentence
  const getSpeakSentence = (rate) => {
    const wholePrice = formatWholeRupees(rate.avgModal);
    const lang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    if (lang === 'hi') {
      return `${rate.commodity} का आज का भाव ${wholePrice} रुपये प्रति क्विंटल है।`;
    }
    if (lang === 'mr') {
      return `${rate.commodity}चा आजचा भाव ${wholePrice} रुपये प्रति क्विंटल आहे.`;
    }
    return `${rate.commodity} price today is ${wholePrice} rupees per quintal.`;
  };

  return (
    <section className="py-16 md:py-20 bg-warm-50 border-b border-neutral-200/60">
      <div className="page-container">
        {/* Section Header */}
        <SectionHeader
          eyebrow={t('home.mandi_eyebrow', 'Live Market Data')}
          title={t('home.mandi_section_title', "Today's Crop Prices")}
          subtitle={t(
            'home.mandi_section_subtitle',
            'Wholesale modal prices directly from Agmarknet to help you buy and sell fairly.'
          )}
          action={
            <div className="flex items-center gap-3">
              <Link
                to="/mandi"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-green-800 hover:text-green-900 transition-colors group"
              >
                <span>{t('home.mandi_view_all', 'See all rates')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          }
        />

        {/* Loading Skeletons with fixed heights to prevent layout shift */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {COMMODITIES.map((name) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-2xs h-[210px] animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-stone-200" />
                  <div className="h-7 w-12 bg-stone-100 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-stone-200 rounded" />
                  <div className="h-7 w-28 bg-stone-200 rounded" />
                  <div className="h-3 w-24 bg-stone-100 rounded" />
                </div>
                <div className="h-3 w-20 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Render Mandi Cards if >= 2 commodities returned */}
        {!isLoading && rates.length >= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {rates.slice(0, 6).map((rate) => {
              const perKg = formatPerKg(rate.avgModal);
              const changeVal = rate.priceChangePercent ?? rate.changePercent;
              const hasChange = changeVal !== undefined && changeVal !== null && !isNaN(changeVal);
              const isUp = hasChange && changeVal >= 0;

              return (
                <div
                  key={rate.commodity}
                  className="group bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-card hover:border-green-600/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Header: Commodity Icon + Name + Listen Button */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <CommodityIcon
                          name={rate.commodity}
                          size="md"
                          className="group-hover:scale-105 transition-transform shrink-0"
                        />
                        <span className="font-bold text-stone-900 text-sm truncate">
                          {rate.commodity}
                        </span>
                      </div>
                      <ListenButton
                        text={getSpeakSentence(rate)}
                        size="sm"
                        variant="ghost"
                        className="!min-h-[34px] !px-2 shrink-0 text-stone-500 hover:text-green-800"
                      />
                    </div>

                    {/* Big Price Typography */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums">
                          ₹{formatWholeRupees(rate.avgModal)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-stone-500">
                        {t('home.mandi_per_quintal', 'per quintal (100 kg)')}
                      </p>
                      {perKg && (
                        <p className="text-xs text-stone-600 font-medium">
                          {t('home.mandi_approx_kg', { price: perKg })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer: Change Chip & Date */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    {hasChange ? (
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                          isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        <span>
                          {Math.abs(changeVal).toFixed(0)}% {isUp ? t('home.mandi_more_yesterday', 'more') : t('home.mandi_less_yesterday', 'less')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-stone-400 font-medium">Modal rate</span>
                    )}
                    <span className="text-stone-400 tabular-nums font-mono text-[10px]">
                      {rate.arrivalDate ? rate.arrivalDate.slice(0, 10) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback notice if fewer than 2 returned data */}
        {!isLoading && rates.length < 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs max-w-lg mx-auto text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Info size={20} />
            </div>
            <p className="text-sm text-stone-700 font-medium">
              {t('home.mandi_updating_notice', 'Mandi rates are being updated. Please check again later.')}
            </p>
            <Link
              to="/mandi"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 hover:underline"
            >
              <span>{t('home.mandi_view_all', 'See all rates')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Source Footnote */}
        <p className="mt-6 text-xs text-stone-500 text-center sm:text-left leading-relaxed">
          {t(
            'home.mandi_footnote',
            'Source: Agmarknet via data.gov.in. These are wholesale mandi rates; shop prices can be higher.'
          )}
        </p>
      </div>
    </section>
  );
}
