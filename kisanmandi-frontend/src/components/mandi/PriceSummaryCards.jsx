import { useTranslation } from 'react-i18next';
import { formatPrice, formatDate, perKg } from '../../utils/format';
import { MapPin, TrendingUp, TrendingDown, DollarSign, Calendar, Activity, BarChart2 } from 'lucide-react';
import Skeleton from '../Skeleton';

export default function PriceSummaryCards({ summary, status, isLoading }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    );
  }

  // If no summary available for selected filters
  if (!summary) return null;

  const isUp = (summary.changePercent || 0) > 0;
  const isDown = (summary.changePercent || 0) < 0;

  const avgModalVal = summary.avgModal ? Math.round(Number(summary.avgModal)) : null;
  const perKgVal = summary.avgModal ? perKg(summary.avgModal) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Average Modal Price */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
              {t('mandi.avg_modal_price')}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {avgModalVal ? `₹${avgModalVal.toLocaleString('en-IN')}` : '—'}
              </span>
              {summary.changePercent !== null && summary.changePercent !== undefined && summary.changePercent !== 0 && (
                <span
                  className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                    isUp ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                  {Math.abs(summary.changePercent).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-2xs font-semibold text-neutral-500">
          <span>per quintal (100 kg)</span>
          {perKgVal && <span className="text-brand-800 font-bold">~₹{perKgVal} / kg</span>}
        </div>
      </div>

      {/* 2. Price Range (Min - Max) */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
              Min - Max Range
            </p>
            <p className="text-xl font-extrabold text-neutral-900 font-mono tabular-nums mt-1">
              {summary.minPrice && summary.maxPrice
                ? `₹${Math.round(summary.minPrice).toLocaleString('en-IN')} - ₹${Math.round(summary.maxPrice).toLocaleString('en-IN')}`
                : '—'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <BarChart2 size={20} />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-neutral-100 text-2xs font-semibold text-neutral-500">
          Spread across reporting APMC mandis
        </div>
      </div>

      {/* 3. Markets Covered */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
              {t('mandi.markets_covered')}
            </p>
            <p className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums mt-1">
              {summary.marketCount || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <MapPin size={20} />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-neutral-100 text-2xs font-semibold text-neutral-500">
          APMC market yards reporting today
        </div>
      </div>

      {/* 4. Latest Arrival Date */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
              {t('mandi.latest_data_date')}
            </p>
            <p className="text-base sm:text-lg font-bold text-neutral-900 mt-1">
              {status?.latestPriceDate ? formatDate(status.latestPriceDate) : 'Today'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Calendar size={20} />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-neutral-100 text-2xs font-semibold text-neutral-500">
          Synced directly from Agmarknet
        </div>
      </div>
    </div>
  );
}
