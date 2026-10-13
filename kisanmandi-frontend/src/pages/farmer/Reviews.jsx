import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import { reviewService, farmerStatsService } from '../../services/phase5Services';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function Reviews() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('reviews.title')} | KisanMandi`);

  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    farmerStatsService.getStats().then(setStats).catch(() => {});
  }, []);

  const loadReviews = () => {
    setLoading(true);
    setError(null);
    reviewService
      .getFarmerReviews(page, 10)
      .then((res) => {
        setReviews(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch((err) => {
        const msg = err.friendlyMessage || err.response?.data?.message || t('reviews.failed_load_reviews');
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [page]);

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('reviews.my_reviews')}</h1>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState
            title={t('reviews.could_not_load_reviews')}
            message={error}
            onRetry={loadReviews}
          />
        ) : (
          <>
            {stats && stats.totalReviews > 0 && (
              <RatingSummary
                average={stats.averageRating}
                count={stats.totalReviews}
                distribution={stats.ratingDistribution}
              />
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <ReviewList reviews={reviews} page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
