import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import { farmerStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { DollarSign, TrendingUp, PackageCheck } from 'lucide-react';

export default function Earnings() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.earnings_analytics')} | KisanMandi`);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = () => {
    setLoading(true);
    setError(null);
    farmerStatsService
      .getStats()
      .then((data) => {
        if (!data) throw new Error(t('farmer.no_earnings_data'));
        setStats(data);
      })
      .catch((err) => {
        setError(err.message || t('farmer.could_not_load_earnings'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout role="FARMER">
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : error || !stats ? (
        <ErrorState
          title={t('farmer.could_not_load_earnings')}
          message={error || t('farmer.failed_retrieve_earnings')}
          onRetry={fetchStats}
        />
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('farmer.earnings_analytics')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title={t('farmer.total_earnings')} value={stats.totalEarnings} type="currency" icon={DollarSign} color="green" />
            <StatCard title={t('farmer.pending_payouts')} value={stats.pendingPayouts} type="currency" icon={TrendingUp} color="blue" />
            <StatCard title={t('farmer.total_sales')} value={stats.totalOrders} icon={PackageCheck} color="indigo" />
          </div>

          {stats.salesByMonth?.length > 0 && (
            <ChartCard title={t('farmer.monthly_sales')} data={stats.salesByMonth} type="bar" dataKey="sales" />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
