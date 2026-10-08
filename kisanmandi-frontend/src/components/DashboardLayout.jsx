import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, UserCircle, Package, PlusCircle, 
  Settings, Users, Tags, Menu, X, Tractor 
} from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const farmerLinks = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/farmer/profile', icon: UserCircle },
    { name: 'My Products', path: '/farmer/products', icon: Package },
    { name: 'Add Product', path: '/farmer/products/add', icon: PlusCircle },
    { name: 'Mandi Rates', path: '/mandi', icon: Tractor },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Farmer Approval', path: '/admin/farmers', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
  ];

  const links = role === 'ADMIN' ? adminLinks : farmerLinks;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 border-t border-gray-200">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-green-700 text-white p-4 flex justify-between items-center">
        <span className="font-semibold">{role === 'ADMIN' ? 'Admin Panel' : 'Farmer Dashboard'}</span>
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
            {role === 'ADMIN' ? 'Admin Panel' : 'Farmer Dashboard'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}</p>
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
                <span>{link.name}</span>
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
