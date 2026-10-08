import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import { PlusCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, productsRes] = await Promise.all([
        farmerService.getProfile(),
        productService.getMyProducts().catch(() => ({ data: [] }))
      ]);
      setProfile(profileRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.active && !p.deleted).length;

  if (isLoading) return <DashboardLayout role="FARMER"><div className="text-center p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Profile Status</h3>
            <div className="mt-2">
              <StatusBadge status={profile?.approvalStatus} />
            </div>
            {profile?.approvalStatus === 'NOT_SUBMITTED' && (
              <p className="text-sm text-gray-600 mt-2">Go to My Profile to complete your setup.</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Active Products</h3>
            <p className="text-3xl font-bold text-green-600 mt-1">{activeProducts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/farmer/products/add" className="flex items-center justify-center space-x-2 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors">
            <PlusCircle size={20} />
            <span className="font-medium">Add New Product</span>
          </Link>
          <Link to="/farmer/products" className="flex items-center justify-center space-x-2 bg-white border border-green-600 text-green-600 p-4 rounded-xl hover:bg-green-50 transition-colors">
            <Package size={20} />
            <span className="font-medium">Manage Products</span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
