import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';
import Button from './ui/Button';
import toast from 'react-hot-toast';
import reviewService from '../services/reviewService';

const FACE_RATINGS = [
  { value: 1, emoji: '😞', key: 'rating_1', fallback: 'Bad' },
  { value: 2, emoji: '😕', key: 'rating_2', fallback: 'Not good' },
  { value: 3, emoji: '🙂', key: 'rating_3', fallback: 'Okay' },
  { value: 4, emoji: '😊', key: 'rating_4', fallback: 'Good' },
  { value: 5, emoji: '🤩', key: 'rating_5', fallback: 'Very good' }
];

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
      className="bg-white p-5 sm:p-7 rounded-3xl shadow-xl border border-neutral-200/90 flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
          {t('reviews.rate_experience')}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          {t('reviews.comment_placeholder')}
        </p>
      </div>

      {/* Face Emoji Rating Row (Accessible Radiogroup) */}
      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-neutral-600">
          {t('reviews.your_rating')} *
        </label>

        {/* 5 Faces with words */}
        <div
          role="radiogroup"
          aria-label={t('reviews.your_rating')}
          className="grid grid-cols-5 gap-2"
        >
          {FACE_RATINGS.map((face) => {
            const isSelected = rating === face.value;
            const label = t(`reviews.${face.key}`, face.fallback);
            return (
              <button
                key={face.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${face.value} - ${label}`}
                onClick={() => setRating(face.value)}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 transition text-center select-none cursor-pointer ${
                  isSelected
                    ? 'border-green-600 bg-green-50 ring-2 ring-green-500/20 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <span className="text-2xl sm:text-3xl filter-none motion-safe:hover:scale-110 transition">
                  {face.emoji}
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-bold mt-1.5 leading-tight ${
                    isSelected ? 'text-green-900' : 'text-neutral-600'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Traditional Stars for precision */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Stars:</span>
            <StarRating value={rating} onChange={setRating} size={26} readOnly={false} />
          </div>
          {rating > 0 && (
            <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 tabular-nums">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      {/* Optional Comment with character counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-neutral-600">
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
          rows={3}
          className="w-full px-4 py-3 text-sm sm:text-base bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition leading-relaxed"
          placeholder={t('reviews.comment_placeholder')}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
        {onCancel && (
          <Button type="button" variant="ghost" size="md" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="min-h-[50px] font-black px-6 shadow-md"
          loading={loading}
          disabled={loading || rating === 0}
        >
          {t('reviews.submit_review')}
        </Button>
      </div>
    </form>
  );
}
