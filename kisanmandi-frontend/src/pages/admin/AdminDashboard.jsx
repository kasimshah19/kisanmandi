import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminService } from '../../services/adminService';
import { adminStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatINR } from '../../utils/format';
import {
  Users,
  UserCheck,
  UserX,
  Package,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Clock,
  Database,
  Star,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  CHART_COLORS,
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  CHART_BAR_PROPS,
  CustomChartTooltip
} from '../../components/charts/chartTheme';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard | KisanMandi');

  const [stats, setStats] = useState(null);
  const [pendingFarmersCount, setPendingFarmersCount] = useState(0);
  const [mandiSyncStatus, setMandiSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, pendingFarmersRes, syncLogsRes] = await Promise.all([
        adminStatsService.getStats().catch(() => null),
        adminService.getFarmers('PENDING').catch(() => ({ data: [] })),
        adminService.getMandiSyncStatus?.().catch(() => null),
      ]);
      setStats(statsData);
      setPendingFarmersCount(pendingFarmersRes.data?.length || statsData?.farmers?.pending || 0);
      setMandiSyncStatus(syncLogsRes?.data || null);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Status donut data for Orders by Status
  const statusColors = {
    PLACED: '#3b82f6', // blue
    ACCEPTED: '#6366f1', // indigo
    PACKED: '#a855f7', // purple
    OUT_FOR_DELIVERY: '#f59e0b', // amber
    DELIVERED: '#10b981', // emerald
    REJECTED: '#ef4444', // red
    CANCELLED: '#6b7280', // gray
  };

  const orderStatusData = stats?.orders?.byStatus
    ? Object.keys(stats.orders.byStatus).map((status) => ({
        name: status.replace('_', ' '),
        value: stats.orders.byStatus[status],
        status,
      }))
    : [];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'Platform Overview' },
          ]}
          title="Admin Dashboard"
          subtitle="Real-time platform activity metrics, user balances, product moderation, and mandi sync health."
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load admin metrics"
            message={error}
            onRetry={loadDashboard}
          />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* StatCards Grid (Links to corresponding admin pages) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Users */}
              <Link to="/admin/users" className="block group">
                <StatCard
                  title="Total Users"
                  value={stats?.users?.total ?? stats?.totalUsers ?? 0}
                  icon={Users}
                  color="blue"
                  hint="Registered accounts"
                  className="group-hover:border-blue-300 group-hover:shadow-md transition"
                />
              </Link>

              {/* Total Farmers */}
              <Link to="/admin/farmers" className="block group">
                <StatCard
                  title="Farmers"
                  value={stats?.users?.farmers ?? 0}
                  icon={UserCheck}
                  color="brand"
                  hint={`${stats?.farmers?.approved ?? 0} approved producers`}
                  className="group-hover:border-brand-300 group-hover:shadow-md transition"
                />
              </Link>

              {/* Total Customers */}
              <Link to="/admin/users" className="block group">
                <StatCard
                  title="Customers"
                  value={stats?.users?.customers ?? 0}
                  icon={Users}
                  color="indigo"
                  hint="Household buyers"
                  className="group-hover:border-indigo-300 group-hover:shadow-md transition"
                />
              </Link>

              {/* Blocked Accounts */}
              <Link to="/admin/users" className="block group">
                <StatCard
                  title="Blocked Users"
                  value={stats?.users?.blocked ?? 0}
                  icon={UserX}
                  color="red"
                  hint="Suspended for review"
                  className="group-hover:border-red-300 group-hover:shadow-md transition"
                />
              </Link>

              {/* Total Orders */}
              <Link to="/admin/orders" className="block group">
                <StatCard
                  title="Total Orders"
                  value={stats?.orders?.total ?? stats?.totalOrders ?? 0}
                  icon={ClipboardList}
                  color="purple"
                  hint={`${stats?.orders?.ordersLast30Days ?? 0} in past 30 days`}
                  className="group-hover:border-purple-300 group-hover:shadow-md transition"
                />
              </Link>

              {/* Delivered GMV */}
              <div className="block">
                <StatCard
                  title="Delivered GMV"
                  value={stats?.revenue?.gmvDelivered ?? stats?.totalSales ?? 0}
                  type="currency"
                  icon={DollarSign}
                  color="green"
                  hint="Total fulfilled volume"
                />
              </div>

              {/* Revenue 30 Days */}
              <div className="block">
                <StatCard
                  title="Revenue (30 Days)"
                  value={stats?.revenue?.revenueLast30Days ?? 0}
                  type="currency"
                  icon={TrendingUp}
                  color="amber"
                  hint="Fulfilled past 30 days"
                />
              </div>

              {/* Pending Approvals */}
              <Link to="/admin/farmers" className="block group">
                <StatCard
                  title="Pending Approvals"
                  value={pendingFarmersCount}
                  icon={Clock}
                  color="amber"
                  hint="Awaiting document verification"
                  className="group-hover:border-amber-300 group-hover:shadow-md transition"
                />
              </Link>
            </div>

            {/* Charts Row 1: Daily Orders & Daily Revenue Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders Per Day Chart */}
              <ChartCard
                title="Orders Per Day"
                subtitle="Recent daily order creation frequency"
              >
                {stats?.ordersPerDay?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.ordersPerDay}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid {...CHART_GRID_PROPS} />
                      <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
                      <YAxis {...CHART_AXIS_PROPS} allowDecimals={false} />
                      <Tooltip content={<CustomChartTooltip isCurrency={false} />} />
                      <Bar
                        dataKey="value"
                        name="Orders"
                        fill={CHART_COLORS.secondary}
                        {...CHART_BAR_PROPS}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                    No daily orders recorded yet
                  </div>
                )}
              </ChartCard>

              {/* Revenue Per Day Chart */}
              <ChartCard
                title="Revenue Per Day (₹)"
                subtitle="Daily fulfilled cash on delivery value"
              >
                {stats?.revenuePerDay?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.revenuePerDay}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid {...CHART_GRID_PROPS} />
                      <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
                      <YAxis {...CHART_AXIS_PROPS} />
                      <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Revenue"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: CHART_COLORS.primary }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : stats?.salesByMonth?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.salesByMonth}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid {...CHART_GRID_PROPS} />
                      <XAxis dataKey="name" {...CHART_AXIS_PROPS} />
                      <YAxis {...CHART_AXIS_PROPS} />
                      <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                      <Bar
                        dataKey="sales"
                        name="Sales"
                        fill={CHART_COLORS.primary}
                        {...CHART_BAR_PROPS}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                    No daily revenue recorded yet
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Charts Row 2: Orders by Status Donut & Top Farmers Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Orders by Status Donut (5 cols) */}
              <div className="lg:col-span-5">
                <ChartCard
                  title="Orders by Status"
                  subtitle="Current fulfillment stage distribution"
                  height={320}
                >
                  {orderStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={statusColors[entry.status] || CHART_COLORS.neutralMid}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip isCurrency={false} />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                      No status data available
                    </div>
                  )}
                </ChartCard>
              </div>

              {/* Top Farmers Table (7 cols) */}
              <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="font-bold text-neutral-900 text-base">Top Performing Producers</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Highest fulfilled customer volume</p>
                    </div>
                    <Link
                      to="/admin/farmers"
                      className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
                    >
                      View All &rarr;
                    </Link>
                  </div>

                  {stats?.topFarmers && stats.topFarmers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-neutral-100 text-2xs uppercase text-neutral-500 font-bold">
                            <th className="py-2.5">Farm</th>
                            <th className="py-2.5 text-right">Orders</th>
                            <th className="py-2.5 text-right">Revenue</th>
                            <th className="py-2.5 text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {stats.topFarmers.slice(0, 5).map((f) => (
                            <tr key={f.farmerId} className="hover:bg-neutral-50/60">
                              <td className="py-2.5 font-bold text-neutral-900 truncate max-w-[140px]">
                                {f.farmName}
                              </td>
                              <td className="py-2.5 text-right font-mono font-medium text-neutral-700">
                                {f.deliveredOrders}
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-brand-900">
                                {formatINR(f.revenue)}
                              </td>
                              <td className="py-2.5 text-right font-semibold text-neutral-700">
                                {f.ratingAvg ? `${f.ratingAvg} ★` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 py-8 text-center font-medium">
                      Producers with fulfilled deliveries will be ranked here.
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-2xs text-neutral-500 font-semibold">
                  <span>Based on all-time delivered volume</span>
                  <Link to="/admin/products" className="hover:text-brand-700">
                    Inspect Listings &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Cards: Mandi Sync Health & Reviews Moderation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mandi Sync Card */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100">
                    <Database size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-neutral-900">Agmarknet Mandi Sync</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Daily automated sync pipeline from data.gov.in
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/mandi-sync"
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-900 transition shrink-0"
                >
                  Sync Logs &rarr;
                </Link>
              </div>

              {/* Reviews Moderation Card */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                    <Star size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-neutral-900">Customer Reviews</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {stats?.reviews?.total ?? 0} total • {stats?.reviews?.hidden ?? 0} hidden by moderation
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/reviews"
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-900 transition shrink-0"
                >
                  Moderate &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
