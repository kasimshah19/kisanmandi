import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminService } from '../../services/adminService';
import { adminStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Users, Tags, Clock, Database, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  useDocumentTitle('Admin Dashboard | KisanMandi');

  const [pendingCount, setPendingCount] = useState(0);
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
      const [farmersRes, statsData] = await Promise.all([
        adminService.getFarmers('PENDING').catch(() => ({ data: [] })),
        adminStatsService.getStats().catch(() => null),
      ]);
      setPendingCount(farmersRes.data?.length || 0);
      setStats(statsData);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
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
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
              <StatCard title="Total Sales" value={stats.totalSales} type="currency" icon={DollarSign} color="green" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={Package} color="indigo" />
              <StatCard title="Total Products" value={stats.totalProducts} icon={Tags} color="purple" />
            </div>
          )}

          {stats?.salesByMonth?.length > 0 && (
            <ChartCard title="Platform Sales Trend" data={stats.salesByMonth} type="bar" dataKey="sales" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{pendingCount}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/admin/farmers" className="text-yellow-700 text-sm font-semibold hover:underline">
                  Review Farmers &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                  <Tags size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Manage Categories</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/admin/categories" className="text-green-700 text-sm font-semibold hover:underline">
                  View Categories &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Mandi Sync</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/admin/mandi-sync" className="text-blue-700 text-sm font-semibold hover:underline">
                  View Sync Logs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
