import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminReviewService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { Star, MessageSquare, Trash2 } from 'lucide-react';

export default function ManageReviews() {
  useDocumentTitle('Manage Reviews | KisanMandi');
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [page]);

  const loadReviews = () => {
    setLoading(true);
    setError(null);
    adminReviewService.getAllReviews(page)
      .then(res => {
        setReviews(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(err => {
        setError('Failed to load reviews. Please check your network connection.');
        toast.error('Failed to load reviews');
      })
      .finally(() => setLoading(false));
  };

  const deleteReview = (id) => {
    if (!window.confirm('Delete this review?')) return;
    adminReviewService.deleteReview(id)
      .then(() => {
        toast.success('Review deleted');
        loadReviews();
      })
      .catch(() => toast.error('Failed to delete review'));
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Moderate customer feedback and ratings across listed produce</p>
        </div>

        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ErrorState title="Unable to Load Reviews" message={error} onRetry={loadReviews} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No reviews found</p>
                      </td>
                    </tr>
                  ) : (
                    reviews.map(review => (
                      <tr key={review.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.productName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{review.customerName || 'Anonymous'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center text-amber-500 font-semibold">
                            <span>{review.rating}</span>
                            <Star size={14} className="ml-1 fill-amber-400 text-amber-400" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={review.comment}>
                          {review.comment || <span className="text-gray-400 italic">No comment</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => deleteReview(review.id)}
                            aria-label={`Delete review by ${review.customerName || 'customer'}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg min-h-[44px] transition-colors"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && !loading && (
              <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
