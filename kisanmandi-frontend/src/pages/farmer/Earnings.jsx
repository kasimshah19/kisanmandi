import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import { farmerStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { DollarSign, TrendingUp, PackageCheck, BarChart3 } from 'lucide-react';

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
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.dashboard'), to: '/farmer/dashboard' },
            { label: t('farmer.earnings_analytics') },
          ]}
          title={t('farmer.earnings_analytics')}
          subtitle="Detailed breakdown of fulfilled sales, collected cash on delivery, and historical monthly trends."
        />

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonCard />
          </div>
        ) : error || !stats ? (
          <ErrorState
            title={t('farmer.could_not_load_earnings')}
            message={error || t('farmer.failed_retrieve_earnings')}
            onRetry={fetchStats}
          />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              <StatCard
                title={t('farmer.total_earnings')}
                value={stats.totalEarnings ?? 0}
                type="currency"
                icon={DollarSign}
                color="green"
                hint="Total cash collected across all fulfilled batches"
              />
              <StatCard
                title={t('farmer.pending_payouts')}
                value={stats.pendingPayouts ?? 0}
                type="currency"
                icon={TrendingUp}
                color="blue"
                hint="Orders currently out for delivery or awaiting confirmation"
              />
              <StatCard
                title={t('farmer.total_sales')}
                value={stats.totalOrders ?? 0}
                icon={PackageCheck}
                color="indigo"
                hint="Completed customer deliveries"
              />
            </div>

            {/* Sales Chart with unified chartTheme */}
            <ChartCard
              title={t('farmer.monthly_sales')}
              subtitle="Aggregated revenue history broken down by monthly harvest cycle"
              data={stats.salesByMonth || []}
              type="bar"
              dataKey="sales"
              emptyMessage="No historical sales recorded yet. Fulfilled customer orders will populate this chart."
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
