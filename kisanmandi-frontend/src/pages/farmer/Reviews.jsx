import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { reviewService, farmerStatsService } from '../../services/phase5Services';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';

export default function Reviews() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmerStatsService.getStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    reviewService.getFarmerReviews(page, 10).then(res => {
      setReviews(res.content);
      setTotalPages(res.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  if (loading) return <DashboardLayout role="FARMER"><div className="p-8 text-center">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">My Reviews</h1>
        
        {stats && stats.totalReviews > 0 && (
          <RatingSummary 
            average={stats.averageRating} 
            count={stats.totalReviews} 
            distribution={stats.ratingDistribution} 
          />
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <ReviewList reviews={reviews} page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>
    </DashboardLayout>
  );
}
