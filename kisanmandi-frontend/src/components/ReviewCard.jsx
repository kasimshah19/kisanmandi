import React from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';
import { formatDate } from '../utils/format';
import { CheckCircle2 } from 'lucide-react';

export default function ReviewCard({ review }) {
  const { t } = useTranslation();
  const maskedName = review.reviewerName 
    ? review.reviewerName.split(' ')[0] + (review.reviewerName.split(' ')[1] ? ' ' + review.reviewerName.split(' ')[1][0] + '.' : '')
    : t('common.customer');

  const initial = (maskedName || 'C')[0].toUpperCase();

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col gap-2.5 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold text-sm flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-neutral-900 text-sm">{maskedName}</p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-100">
                <CheckCircle2 size={11} className="text-brand-600" />
                {t('reviews.verified_purchase')}
              </span>
            </div>
            <div className="mt-1">
              <StarRating value={review.rating} size={15} />
            </div>
          </div>
        </div>
        <span className="text-xs text-neutral-500 font-medium tabular-nums shrink-0">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {review.comment && (
        <p className="text-sm text-neutral-700 leading-relaxed pt-1 whitespace-pre-wrap pl-12">
          {review.comment}
        </p>
      )}
    </div>
  );
}
