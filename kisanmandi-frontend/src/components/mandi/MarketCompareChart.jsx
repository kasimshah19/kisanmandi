import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatPrice } from '../../utils/format';
import {
  CHART_COLORS,
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  CustomChartTooltip
} from '../charts/chartTheme';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import NoResults from '../illustrations/NoResults';

export default function MarketCompareChart({ data, isLoading, commodity }) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      displayMarket:
        item.market?.length > 14 ? item.market.substring(0, 14) + '...' : item.market,
      avgModalPrice: Math.round(Number(item.modalPrice || 0)),
    }));
  }, [data]);

  if (!commodity) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-sm font-semibold text-neutral-500 max-w-sm">
          {t('mandi.select_commodity_compare_hint')}
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
          title={t('mandi.no_compare_data')}
          message="No comparative market arrivals found for this crop today."
        />
      </div>
    );
  }

  const maxPrice = Math.max(...chartData.map((d) => d.avgModalPrice));

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-neutral-200/90 flex flex-col justify-between">
      <div className="pb-4 mb-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
            {t('mandi.top_markets_for', { commodity })}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Market price comparison across leading mandi yards (₹ / quintal)
          </p>
        </div>
      </div>

      <div className="w-full h-[260px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="displayMarket"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={95}
            />
            <Tooltip
              content={
                <CustomChartTooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
              }
            />
            <Bar dataKey="avgModalPrice" radius={[0, 6, 6, 0]} barSize={22}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.avgModalPrice === maxPrice ? CHART_COLORS.primary : CHART_COLORS.primaryLight}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
