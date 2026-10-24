import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import { farmerStatsService } from '../../services/phase5Services';
import { productService } from '../../services/productService';
import ChartCard from '../../components/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatINR, unitLabel } from '../../utils/format';
import { DollarSign, TrendingUp, PackageCheck, BarChart3, Award, Package } from 'lucide-react';

export default function Earnings() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.earnings_analytics')} | KisanMandi`);

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, productsRes] = await Promise.all([
        farmerStatsService.getStats(),
        productService.getMyProducts().catch(() => ({ data: [] })),
      ]);
      if (!statsData) throw new Error(t('farmer.no_earnings_data'));
      setStats(statsData);
      setProducts(productsRes.data || []);
    } catch (err) {
      setError(err.message || t('farmer.could_not_load_earnings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalEarnings = stats?.totalEarnings ?? 0;
  const pendingPayouts = stats?.pendingPayouts ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;

  // Best selling products derived from product inventory / sales
  const topCrops = products
    .filter((p) => !p.deleted)
    .slice(0, 5);

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
          subtitle="Here is what you earned from fulfilled buyer deliveries and cash collected."
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
            onRetry={fetchData}
          />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* One Huge Number Card: Earned this month */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    {t('farmer.earned_total_label', 'Earned from orders')}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-brand-900 font-mono tracking-tight mt-1">
                    {formatINR(totalEarnings)}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
                    {totalOrders > 0
                      ? `Collected across ${totalOrders} completed customer deliveries.`
                      : 'All cash collected when orders are marked as delivered.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:border-l sm:border-neutral-200 sm:pl-6">
                  <div>
                    <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider block">
                      Pending confirmation
                    </span>
                    <span className="text-2xl font-extrabold text-neutral-900 font-mono">
                      {formatINR(pendingPayouts)}
                    </span>
                    <p className="text-2xs text-neutral-500 mt-0.5">Orders on the way</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Chart with unified chartTheme & short plain sentence */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-neutral-200/90 space-y-3">
              <div className="pb-3 border-b border-neutral-100">
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  {t('farmer.monthly_sales', 'Monthly Harvest Earnings')}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                  Here is how your cash revenue progressed each month from local deliveries.
                </p>
              </div>

              <ChartCard
                title=""
                data={stats.salesByMonth || []}
                type="bar"
                dataKey="sales"
                emptyMessage="No completed deliveries yet this season. Once buyers receive crops, your monthly bar chart appears here."
              />
            </div>

            {/* Best Selling Produce in Plain Words */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-neutral-200/90 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <Award size={20} className="text-brand-700" />
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  Best Selling Crops
                </h3>
              </div>

              {topCrops.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {topCrops.map((crop, idx) => (
                    <div key={crop.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-neutral-100 text-neutral-700 font-extrabold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-neutral-900">{crop.name}</p>
                          <p className="text-xs text-neutral-500 font-medium">{crop.categoryName || 'Farm crop'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-neutral-900 font-mono">
                          {formatINR(crop.pricePerUnit)}
                        </span>
                        <span className="text-xs text-neutral-500 ml-1">
                          / {unitLabel(crop.unit, t)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-3">
                  No crops listed yet. List produce to start tracking best sellers.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
