import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminService } from '../../services/adminService';
import { Users, Tags, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminService.getFarmers('PENDING');
      setPendingCount(res.data.length);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <DashboardLayout role="ADMIN"><div className="p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
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
              <Link to="/admin/farmers" className="text-yellow-600 text-sm font-medium hover:underline">
                Review Farmers &rarr;
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Tags size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Manage Categories</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link to="/admin/categories" className="text-green-600 text-sm font-medium hover:underline">
                View Categories &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
