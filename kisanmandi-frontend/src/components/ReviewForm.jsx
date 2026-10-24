import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';
import Button from './ui/Button';
import toast from 'react-hot-toast';
import reviewService from '../services/reviewService';

export default function ReviewForm({ orderId, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('reviews.your_rating'));
      return;
    }
    setLoading(true);
    try {
      await reviewService.createReview({ orderId, rating, comment });
      toast.success(t('reviews.submit_review'));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200/90 flex flex-col gap-4"
    >
      <div>
        <h3 className="text-base font-bold text-neutral-900">{t('reviews.rate_experience')}</h3>
        <p className="text-xs text-neutral-500 mt-0.5">{t('reviews.comment_placeholder')}</p>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
          {t('reviews.your_rating')} *
        </label>
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 inline-flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size={28} readOnly={false} />
          {rating > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            {t('reviews.comment_optional')}
          </label>
          <span className="text-xs font-semibold text-neutral-400 tabular-nums">
            {comment.length} / 500
          </span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition leading-relaxed"
          placeholder={t('reviews.comment_placeholder')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={loading}
          disabled={loading || rating === 0}
        >
          {t('reviews.submit_review')}
        </Button>
      </div>
    </form>
  );
}
