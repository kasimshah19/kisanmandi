import React from 'react';
import StarRating from './StarRating';

export default function RatingSummary({ average = 0, count = 0, distribution = {} }) {
  const avg = Number(average) || 0;
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col items-center text-center">
        <span className="text-4xl font-bold text-gray-900">{avg.toFixed(1)}</span>
        <StarRating value={avg} size={24} />
        <span className="text-sm text-gray-500 mt-2">{count} {count === 1 ? 'review' : 'reviews'}</span>
      </div>
      <div className="flex-1 w-full space-y-2">
        {[5, 4, 3, 2, 1].map(star => {
          const val = distribution[star] || 0;
          const percentage = count > 0 ? (val / count) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-4 text-right text-gray-600">{star}</span>
              <StarRating value={1} size={14} />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
              </div>
              <span className="w-8 text-right text-gray-500">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
