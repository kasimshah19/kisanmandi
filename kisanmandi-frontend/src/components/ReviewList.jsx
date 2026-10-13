import React from 'react';
import { useTranslation } from 'react-i18next';
import ReviewCard from './ReviewCard';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { MessageSquare } from 'lucide-react';

export default function ReviewList({ reviews, page, totalPages, setPage }) {
  const { t } = useTranslation();
  if (!reviews || reviews.length === 0) {
    return <EmptyState icon={MessageSquare} title={t('reviews.no_reviews_yet')} message={t('reviews.no_reviews_desc')} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
