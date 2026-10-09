import React from 'react';
import ReviewCard from './ReviewCard';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { MessageSquare } from 'lucide-react';

export default function ReviewList({ reviews, page, totalPages, setPage }) {
  if (!reviews || reviews.length === 0) {
    return <EmptyState icon={MessageSquare} title="No reviews yet" message="Be the first to leave a review." />;
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
