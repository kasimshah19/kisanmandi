import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, UserCircle, Package, PlusCircle, 
  Users, Tags, Menu, X, Tractor, ClipboardList, Database, DollarSign, Star, MessageSquare 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { farmerOrderService } from '../services/farmerOrderService';

const DashboardLayout = ({ children, role }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [placedCount, setPlacedCount] = useState(0);

  // Fetch PLACED count for farmer sidebar badge
  useEffect(() => {
    if (role === 'FARMER') {
      farmerOrderService.summary()
        .then(res => setPlacedCount(res.data.placed || 0))
        .catch(() => {});
    }
  }, [role, location.pathname]); // refresh on route change

  const farmerLinks = [
    { name: t('nav.dashboard'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: t('farmer.my_profile'), path: '/farmer/profile', icon: UserCircle },
    { name: t('farmer.manage_products'), path: '/farmer/products', icon: Package },
    { name: t('farmer.add_new_product'), path: '/farmer/products/add', icon: PlusCircle },
    { name: t('farmer.manage_orders'), path: '/farmer/orders', icon: ClipboardList, badge: placedCount },
    { name: t('nav.earnings'), path: '/farmer/earnings', icon: DollarSign },
    { name: t('nav.reviews'), path: '/farmer/reviews', icon: Star },
    { name: t('nav.mandi_rates'), path: '/farmer/mandi', icon: Tractor },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Farmer Approval', path: '/admin/farmers', icon: Users },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Mandi Sync Logs', path: '/admin/mandi-sync', icon: Database },
  ];

  const links = role === 'ADMIN' ? adminLinks : farmerLinks;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 border-t border-gray-200">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-green-700 text-white p-4 flex justify-between items-center">
        <span className="font-semibold">{role === 'ADMIN' ? 'Admin Panel' : t('farmer.dashboard_title')}</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Top Menu */}
      <aside className={`
        md:w-64 bg-white shadow-lg md:block
        ${isMobileMenuOpen ? 'block' : 'hidden'}
      `}>
        <div className="p-6 hidden md:block">
          <h2 className="text-xl font-bold text-green-800">
            {role === 'ADMIN' ? 'Admin Panel' : t('farmer.dashboard_title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {role === 'ADMIN' ? `Welcome, ${user?.name}` : t('common.welcome_user', { name: user?.name })}
          </p>
        </div>
        
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-green-50 text-green-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'}
                `}
              >
                <Icon size={20} />
                <span className="flex-1">{link.name}</span>
                {/* Badge for order count */}
                {link.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
