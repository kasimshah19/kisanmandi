import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  CHART_COLORS,
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  CHART_BAR_PROPS,
  CustomChartTooltip
} from './charts/chartTheme';

export default function ChartCard({
  title,
  subtitle,
  children,
  data,
  type = 'bar',
  dataKey = 'sales',
  height,
  actions = null,
  emptyMessage,
  className = '',
}) {
  const hasData = data && data.length > 0;

  return (
    <div className={`bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex flex-col justify-between ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100">
          <div>
            {title && <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={`w-full ${height ? '' : 'h-[260px] md:h-[320px]'}`} style={height ? { height } : undefined}>
        {children ? (
          children
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis dataKey="name" {...CHART_AXIS_PROPS} />
              <YAxis {...CHART_AXIS_PROPS} />
              <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
              <Bar dataKey={dataKey} fill={CHART_COLORS.primary} {...CHART_BAR_PROPS} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs sm:text-sm text-neutral-400 font-medium">
            {emptyMessage || 'No trend data recorded yet'}
          </div>
        )}
      </div>
    </div>
  );
}
