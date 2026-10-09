import React, { useState } from 'react';
import StarRating from './StarRating';
import toast from 'react-hot-toast';
import reviewService from '../services/reviewService';

export default function ReviewForm({ orderId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await reviewService.createReview({ orderId, rating, comment });
      toast.success('Review submitted successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900">Rate your experience</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRating value={rating} onChange={setRating} size={32} readOnly={false} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
          placeholder="Share details of your own experience at this place"
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {comment.length}/500
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
