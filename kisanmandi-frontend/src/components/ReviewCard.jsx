import React from 'react';
import StarRating from './StarRating';
import { formatDate } from '../utils/format';

export default function ReviewCard({ review }) {
  const maskedName = review.reviewerName 
    ? review.reviewerName.split(' ')[0] + (review.reviewerName.split(' ')[1] ? ' ' + review.reviewerName.split(' ')[1][0] + '.' : '')
    : 'Customer';

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900">{maskedName}</p>
          <div className="mt-1">
            <StarRating value={review.rating} size={16} />
          </div>
        </div>
        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
      </div>
      {review.comment && (
        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{review.comment}</p>
      )}
    </div>
  );
}
