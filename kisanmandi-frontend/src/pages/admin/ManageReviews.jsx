import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminReviewService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [page]);

  const loadReviews = () => {
    setLoading(true);
    adminReviewService.getAllReviews(page).then(res => {
      setReviews(res.content);
      setTotalPages(res.totalPages);
    }).catch(() => toast.error('Failed to load reviews')).finally(() => setLoading(false));
  };

  const deleteReview = (id) => {
    if(!window.confirm('Delete this review?')) return;
    adminReviewService.deleteReview(id).then(() => {
      toast.success('Review deleted');
      loadReviews();
    }).catch(() => toast.error('Failed to delete review'));
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Reviews</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center text-yellow-400">
                        {review.rating} <Star size={14} className="ml-1 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{review.comment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => deleteReview(review.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
