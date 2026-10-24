import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminReviewService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { Star, MessageSquare, Trash2, Search, Filter } from 'lucide-react';

export default function ManageReviews() {
  useDocumentTitle('Manage Reviews | KisanMandi');
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & delete state
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [reviewToDelete, setReviewToDelete] = useState(null);

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
        const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load reviews';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleConfirmDelete = () => {
    if (!reviewToDelete) return;
    adminReviewService.deleteReview(reviewToDelete.id)
      .then(() => {
        toast.success('Customer review deleted');
        setReviewToDelete(null);
        loadReviews();
      })
      .catch(() => {
        toast.error('Failed to delete review');
        setReviewToDelete(null);
      });
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchRating = ratingFilter === 'ALL' || String(r.rating) === ratingFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (r.productName && r.productName.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q));
      return matchRating && matchQuery;
    });
  }, [reviews, ratingFilter, searchQuery]);

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="Customer Reviews"
          subtitle="Audit ratings, feedback authenticity, and customer comments across the marketplace"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
        />

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Stars:
            </span>
            {['ALL', '5', '4', '3', '2', '1'].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingFilter(star)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  ratingFilter === star
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                {star === 'ALL' ? 'All Ratings' : `${star} ★`}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search product, customer, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <ErrorState title="Unable to Load Reviews" message={error} onRetry={loadReviews} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">Produce Item</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Feedback Comment</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-32"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-16"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-48"></div></td>
                        <td className="px-5 py-4 text-right"><div className="h-8 bg-neutral-200 rounded-xl w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-neutral-900 mb-1">No reviews found</p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery || ratingFilter !== 'ALL'
                            ? 'No customer reviews match your search or filter.'
                            : 'No customer feedback has been submitted yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map(review => (
                      <tr key={review.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-neutral-900 text-sm whitespace-nowrap">
                          {review.productName || 'N/A'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-neutral-800 font-medium">
                          {review.customerName || 'Anonymous Customer'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span>{review.rating}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-600 max-w-sm truncate" title={review.comment}>
                          {review.comment ? (
                            <span>"{review.comment}"</span>
                          ) : (
                            <span className="text-neutral-400 italic">No written comment</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(review)}
                            aria-label={`Delete review by ${review.customerName || 'customer'}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog 
          isOpen={!!reviewToDelete}
          title="Delete Customer Review"
          message={`Are you sure you want to delete this ${reviewToDelete?.rating}-star review for "${reviewToDelete?.productName}"? This action cannot be undone.`}
          confirmText="Delete Review"
          onConfirm={handleConfirmDelete}
          onCancel={() => setReviewToDelete(null)}
        />
      </div>
    </DashboardLayout>
  );
}
