import React from 'react';
import { formatINR } from '../utils/format';

/**
 * StatCard Component
 * Displays a high-contrast metric card with icon tile, label, tabular-nums value, and optional hint/trend.
 * Guarantees zero rendering instead of NaN when passed null/undefined/invalid values.
 */
export default function StatCard({
  icon: Icon,
  label,
  title,
  value,
  hint,
  type,
  color = 'brand',
  trend,
  className = '',
}) {
  const displayLabel = label || title;

  // Safe numerical coercion: ensure null/undefined/NaN is cleanly handled as 0 or fallback, never NaN
  let displayValue;
  if (value === null || value === undefined || value === '') {
    displayValue = type === 'currency' ? '—' : '0';
  } else if (type === 'currency') {
    const num = Number(value);
    displayValue = isNaN(num) ? '—' : formatINR(num);
  } else {
    const num = Number(value);
    displayValue = isNaN(num) ? '0' : num.toLocaleString('en-IN');
  }

  const colorVariants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  const activeColor = colorVariants[color] || colorVariants.brand;

  return (
    <div className={`bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 flex items-start justify-between gap-4 transition-all hover:shadow-sm ${className}`}>
      <div className="space-y-1.5 flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wide truncate">
          {displayLabel}
        </p>
        <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-mono tabular-nums truncate">
          {displayValue}
        </p>
        {(hint || trend) && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {trend && (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {trend}
              </span>
            )}
            {hint && <p className="text-xs text-neutral-400 truncate">{hint}</p>}
          </div>
        )}
      </div>

      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${activeColor}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
