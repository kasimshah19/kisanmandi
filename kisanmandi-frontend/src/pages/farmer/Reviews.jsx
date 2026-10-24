import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import { reviewService, farmerStatsService } from '../../services/phase5Services';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';
import PageHeader from '../../components/ui/PageHeader';
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
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.dashboard'), to: '/farmer/dashboard' },
            { label: t('reviews.my_reviews') },
          ]}
          title={t('reviews.my_reviews')}
          subtitle="Customer testimonials, verified buyer feedback, and rating distribution for your farm."
        />

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
          <div className="space-y-6 sm:space-y-8">
            {stats && stats.totalReviews > 0 && (
              <RatingSummary
                average={stats.averageRating}
                count={stats.totalReviews}
                distribution={stats.ratingDistribution}
              />
            )}

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-neutral-200/90">
              <ReviewList reviews={reviews} page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
