import React from 'react';
import { formatINR } from '../../utils/format';

/**
 * Shared Chart Theme for KisanMandi (Part 3)
 * Provides consistent color tokens, typography, grid styling, and formatted tooltip.
 */
export const CHART_COLORS = {
  primary: '#15803d',     // brand green 700
  primaryLight: '#22c55e',// green 500
  secondary: '#2563eb',   // blue 600
  accent: '#f59e0b',      // harvest amber 500
  danger: '#dc2626',      // red 600
  neutralDark: '#1f2937', // gray 800
  neutralMid: '#6b7280',  // gray 500
  neutralLight: '#e5e7eb',// gray 200
  grid: '#f3f4f6',        // subtle dashed gray
  background: '#ffffff',
};

export const CHART_AXIS_PROPS = {
  tick: { fontSize: 12, fill: '#6b7280' },
  tickLine: false,
  axisLine: { stroke: '#e5e7eb' },
};

export const CHART_GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: '#f3f4f6',
  vertical: false,
};

export const CHART_BAR_PROPS = {
  radius: [6, 6, 0, 0],
  maxBarSize: 42,
};

/**
 * Custom Tooltip Component for Recharts
 * Formats values into clean currency or counts with tabular-nums.
 */
export const CustomChartTooltip = ({ active, payload, label, formatter, isCurrency = true }) => {
  if (active && payload && payload.length) {
    const labelElement = label
      ? React.createElement('p', { className: 'font-semibold text-neutral-900 mb-1.5 pb-1 border-b border-neutral-100' }, label)
      : null;

    const items = payload.map((entry, index) => {
      const rawVal = entry.value;
      let formattedVal = rawVal;
      if (formatter) {
        formattedVal = formatter(rawVal, entry.name, entry);
      } else if (isCurrency) {
        const num = Number(rawVal) || 0;
        formattedVal = formatINR(num);
      } else {
        formattedVal = Number(rawVal).toLocaleString('en-IN');
      }

      const colorDot = React.createElement('span', {
        className: 'w-2 h-2 rounded-full shrink-0',
        style: { backgroundColor: entry.color || entry.fill || CHART_COLORS.primary }
      });

      const nameLabel = React.createElement(
        'span',
        { className: 'flex items-center gap-1.5 text-neutral-600 font-medium' },
        colorDot,
        `${entry.name || 'Value'}:`
      );

      const valLabel = React.createElement(
        'span',
        { className: 'font-bold text-neutral-900 font-mono' },
        formattedVal
      );

      return React.createElement(
        'div',
        { key: `item-${index}`, className: 'flex items-center justify-between gap-3' },
        nameLabel,
        valLabel
      );
    });

    const listContainer = React.createElement('div', { className: 'space-y-1' }, items);

    return React.createElement(
      'div',
      { className: 'bg-white px-3.5 py-2.5 rounded-xl shadow-lg border border-neutral-200/80 text-xs font-sans min-w-[120px]' },
      labelElement,
      listContainer
    );
  }
  return null;
};
