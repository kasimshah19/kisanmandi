import React from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';

export default function RatingSummary({ average = 0, count = 0, distribution = {} }) {
  const { t } = useTranslation();
  const avg = Number(average) || 0;

  const barColor = (star) => {
    if (star >= 4) return 'bg-brand-600';
    if (star === 3) return 'bg-amber-500';
    return 'bg-neutral-400';
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center p-6 bg-white rounded-2xl shadow-sm border border-neutral-200/90">
      <div className="flex flex-col items-center text-center sm:min-w-[140px] shrink-0">
        <span className="text-5xl font-black text-neutral-900 tracking-tight">
          {avg.toFixed(1)}
        </span>
        <div className="my-1.5">
          <StarRating value={avg} size={22} />
        </div>
        <span className="text-xs font-semibold text-neutral-500">
          {t('reviews.based_on_reviews', { count })}
        </span>
      </div>

      <div className="w-full flex-1 space-y-2.5">
        {[5, 4, 3, 2, 1].map(star => {
          const val = distribution[star] || 0;
          const percentage = count > 0 ? (val / count) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-xs font-medium">
              <span className="w-4 text-right font-bold text-neutral-700">{star}</span>
              <StarRating value={1} size={14} />
              <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColor(star)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-9 text-right text-neutral-500 tabular-nums font-semibold">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
