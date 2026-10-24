import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, ArrowRight, Sprout, Info } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import IconTile from '../ui/IconTile';
import SpeakButton from '../ui/SpeakButton';
import { mandiService } from '../../services/mandiService';

const COMMODITIES = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soyabean', 'Cotton'];
const CACHE_KEY = 'kisanmandi_home_mandi_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default function MandiRatesSection({ onRatesLoaded }) {
  const { t } = useTranslation();
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check sessionStorage cache first to prevent hammering free tier
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.data) && parsed.data.length > 0) {
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

  return (
    <section className="py-16 md:py-20 bg-warm-50 border-b border-neutral-200/60">
      <div className="page-container">
        {/* Section Header */}
        <SectionHeader
          eyebrow={t('home.mandi_eyebrow')}
          title={t('home.mandi_section_title')}
          subtitle={t('home.mandi_section_subtitle')}
          action={
            <div className="flex items-center gap-2.5">
              {rates.length > 0 && (
                <SpeakButton
                  text={`Aaj ka mandi bhav: ` + rates.map(r => `${r.commodity}: ₹${formatWholeRupees(r.avgModal)} prati quintal`).join(', ')}
                  size="sm"
                  label={t('speech.listen_all', 'Listen Rates')}
                />
              )}
              <Link
                to="/mandi"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:text-green-800 transition-colors group"
              >
                <span>{t('home.mandi_view_all')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          }
        />

        {/* Loading Skeletons with fixed heights to prevent layout shift */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {COMMODITIES.map((name) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-4 border border-neutral-200/70 shadow-2xs h-[170px] animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-neutral-200" />
                  <div className="h-4 w-16 bg-neutral-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-24 bg-neutral-200 rounded" />
                  <div className="h-3 w-16 bg-neutral-100 rounded" />
                </div>
                <div className="h-3 w-20 bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Render Mandi Cards if >= 2 commodities returned */}
        {!isLoading && rates.length >= 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {rates.map((rate) => {
              const perKg = formatPerKg(rate.avgModal);
              const changeVal = rate.priceChangePercent ?? rate.changePercent;
              const hasChange = changeVal !== undefined && changeVal !== null && !isNaN(changeVal);
              const isUp = hasChange && changeVal >= 0;

              return (
                <Link
                  key={rate.commodity}
                  to={`/mandi?commodity=${encodeURIComponent(rate.commodity)}`}
                  className="group bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Header: Icon + Name + Speak Button */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <IconTile
                          icon={Sprout}
                          tone="green"
                          size="sm"
                          className="group-hover:scale-105 transition-transform shrink-0"
                        />
                        <span className="font-bold text-neutral-900 text-sm truncate">
                          {rate.commodity}
                        </span>
                      </div>
                      <SpeakButton
                        text={`${rate.commodity} mandi bhav: lagbhag ${formatWholeRupees(rate.avgModal)} rupaye prati quintal, lagbhag ${perKg || ''} rupaye kilo`}
                        size="sm"
                        variant="ghost"
                        className="!min-h-[30px] !px-1.5 shrink-0"
                      />
                    </div>

                    {/* Modal Price */}
                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                          ₹{formatWholeRupees(rate.avgModal)}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-medium">/ qtl</span>
                      </div>
                      {perKg && (
                        <p className="text-xs text-neutral-500">
                          {t('home.mandi_approx_kg', { price: perKg })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer: Change Chip or Arrival Date */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                    {hasChange ? (
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md text-[10px] ${
                          isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        <span>{Math.abs(changeVal).toFixed(1)}%</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-medium">Modal rate</span>
                    )}
                    <span className="text-neutral-400 tabular-nums">
                      {rate.arrivalDate ? rate.arrivalDate.slice(0, 10) : ''}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Fallback card if fewer than 2 returned data */}
        {!isLoading && rates.length < 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs max-w-lg mx-auto text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Info size={20} />
            </div>
            <p className="text-sm text-neutral-700 font-medium">
              {t('home.mandi_updating_notice')}
            </p>
            <Link
              to="/mandi"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
            >
              <span>{t('home.mandi_view_all')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Source Footnote */}
        <p className="mt-6 text-xs text-neutral-500 text-center sm:text-left leading-relaxed">
          {t('home.mandi_footnote')}
        </p>
      </div>
    </section>
  );
}
