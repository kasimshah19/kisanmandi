import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatShortDate, formatPrice } from '../../utils/format';
import {
  CHART_COLORS,
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  CustomChartTooltip
} from '../charts/chartTheme';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import NoResults from '../illustrations/NoResults';

export default function PriceTrendChart({
  data,
  isLoading,
  days,
  onDaysChange,
  commodity,
  hasDemoData,
}) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data].reverse().map((item) => ({
      ...item,
      displayDate: formatShortDate(item.date),
      avgModalPrice: Math.round(Number(item.avgModal || 0)),
      avgMaxPrice: Math.round(Number(item.maxPrice || 0)),
      avgMinPrice: Math.round(Number(item.minPrice || 0)),
    }));
  }, [data]);

  if (!commodity) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-sm font-semibold text-neutral-500 max-w-sm">
          {t('mandi.select_commodity_hint')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-200/90 space-y-4">
        <Skeleton className="h-6 w-48 rounded-xl" />
        <Skeleton className="h-[260px] md:h-[320px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-200/90 min-h-[300px]">
        <EmptyState
          illustration={NoResults}
          title={t('mandi.no_trend_data')}
          message="No historical price fluctuations recorded for this crop over the chosen timeline."
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-neutral-200/90 relative flex flex-col justify-between">
      {/* Header & Segmented 7/30 Days Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-neutral-100 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
            {t('mandi.price_trend_for', { commodity })}
          </h3>
          {hasDemoData && (
            <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 text-2xs px-2 py-0.5 rounded-full mt-1 font-semibold">
              Includes benchmark fallback data
            </span>
          )}
        </div>

        {/* Segmented Days Control */}
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => onDaysChange(7)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              days === 7
                ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('mandi.days_7')}
          </button>
          <button
            onClick={() => onDaysChange(30)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              days === 30
                ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('mandi.days_30')}
          </button>
        </div>
      </div>

      {chartData.length === 1 && (
        <div className="mb-3 px-3 py-2 bg-blue-50 text-blue-800 text-xs rounded-xl border border-blue-200 font-medium">
          Trend builds up day by day. Currently showing 1 day of arrivals.
        </div>
      )}

      {/* Recharts LineChart with unified theme */}
      <div className="w-full h-[260px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis dataKey="displayDate" {...CHART_AXIS_PROPS} />
            <YAxis {...CHART_AXIS_PROPS} />
            <Tooltip
              content={
                <CustomChartTooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
              }
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line
              type="monotone"
              dataKey="avgModalPrice"
              name="Modal Price (₹)"
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              dot={{ r: 3, fill: CHART_COLORS.primary }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="avgMaxPrice"
              name="Max Price (₹)"
              stroke={CHART_COLORS.accent}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avgMinPrice"
              name="Min Price (₹)"
              stroke={CHART_COLORS.neutralMid}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
