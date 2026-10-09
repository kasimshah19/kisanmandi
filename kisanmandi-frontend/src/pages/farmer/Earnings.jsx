import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { farmerStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { DollarSign, TrendingUp, PackageCheck } from 'lucide-react';

export default function Earnings() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmerStatsService.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="FARMER"><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (!stats) return <DashboardLayout role="FARMER"><div className="p-8 text-center text-red-500">Failed to load stats.</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Earnings & Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Earnings" value={stats.totalEarnings} type="currency" icon={DollarSign} color="green" />
          <StatCard title="Pending Payouts" value={stats.pendingPayouts} type="currency" icon={TrendingUp} color="blue" />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={PackageCheck} color="indigo" />
        </div>

        {stats.salesByMonth?.length > 0 && (
          <ChartCard title="Monthly Sales" data={stats.salesByMonth} type="bar" dataKey="sales" />
        )}
      </div>
    </DashboardLayout>
  );
}
