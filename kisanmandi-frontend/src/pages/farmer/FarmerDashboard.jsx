import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import { farmerStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { TrendingUp, Star, DollarSign, Package, Eye, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.dashboard_title')} | KisanMandi`);

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, productsRes, statsRes] = await Promise.all([
        farmerService.getProfile(),
        productService.getMyProducts().catch(() => ({ data: [] })),
        farmerStatsService.getStats().catch(() => null),
      ]);
      setProfile(profileRes.data);
      setProducts(productsRes.data);
      setStats(statsRes);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const activeProducts = products.filter((p) => p.active && !p.deleted).length;

  return (
    <DashboardLayout role="FARMER">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title={t('errors.generic_retry')}
          message={error}
          onRetry={loadDashboard}
        />
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('farmer.dashboard_title')}</h1>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title={t('farmer.total_earnings')} value={stats.totalEarnings} type="currency" icon={DollarSign} />
              <StatCard title={t('farmer.pending_payouts')} value={stats.pendingPayouts} type="currency" icon={TrendingUp} />
              <StatCard title={t('reviews.average_rating')} value={stats.averageRating} icon={Star} />
              <StatCard title={t('farmer.total_reviews')} value={stats.totalReviews} icon={Eye} />
            </div>
          )}

          {stats?.salesByMonth?.length > 0 && (
            <ChartCard title={t('farmer.sales_trend')} data={stats.salesByMonth} type="bar" dataKey="sales" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">{t('farmer.profile_status')}</h3>
              <div className="mt-2">
                <StatusBadge status={profile?.approvalStatus} />
              </div>
              {profile?.approvalStatus === 'NOT_SUBMITTED' && (
                <p className="text-sm text-gray-600 mt-2">{t('farmer.complete_profile_tip')}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">{t('farmer.total_products')}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">{t('farmer.active_products')}</h3>
              <p className="text-3xl font-bold text-green-700 mt-1">{activeProducts}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/farmer/products/add"
              className="flex items-center justify-center space-x-2 bg-green-700 text-white p-4 rounded-xl hover:bg-green-800 transition min-h-[48px] font-medium active:scale-[0.99]"
            >
              <PlusCircle size={20} />
              <span>{t('farmer.add_new_product')}</span>
            </Link>
            <Link
              to="/farmer/products"
              className="flex items-center justify-center space-x-2 bg-white border border-green-700 text-green-700 p-4 rounded-xl hover:bg-green-50 transition min-h-[48px] font-medium active:scale-[0.99]"
            >
              <Package size={20} />
              <span>{t('farmer.manage_products')}</span>
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FarmerDashboard;
