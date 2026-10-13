import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, ShoppingCart, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, getDashboardPath } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // Role badge colors
  const roleBadge = {
    FARMER:   'bg-green-100 text-green-800',
    CUSTOMER: 'bg-blue-100 text-blue-800',
    ADMIN:    'bg-red-100 text-red-800',
  };

  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-green-700 font-bold text-2xl">
          <Leaf className="h-6 w-6" />
          <span>KisanMandi</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-5">
          <Link to="/" className="text-gray-600 hover:text-green-700 transition font-medium">
            {t('nav.home')}
          </Link>
          <Link to="/mandi" className="text-gray-600 hover:text-green-700 transition font-medium">
            {t('nav.mandi_rates')}
          </Link>
          <Link to="/products" className="text-gray-600 hover:text-green-700 transition font-medium">
            {t('nav.browse')}
          </Link>

          {isAuthenticated ? (
            <>
              {/* Customer-specific links */}
              {isCustomer && (
                <>
                  <Link to="/customer/orders" className="text-gray-600 hover:text-green-700 transition flex items-center gap-1 font-medium">
                    <ClipboardList className="h-4 w-4" />
                    <span>{t('nav.my_orders')}</span>
                  </Link>
                  <Link
                    to="/customer/cart"
                    aria-label={`Shopping cart with ${cartCount} items`}
                    className="relative text-gray-600 hover:text-green-700 transition p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <Link to={getDashboardPath(user.role)}
                className="text-gray-600 hover:text-green-700 transition font-medium">
                {t('nav.dashboard')}
              </Link>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role] || ''}`}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition min-h-[44px] px-2 font-medium">
                <LogOut className="h-4 w-4" />
                <span>{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-green-700 transition font-medium">
                {t('nav.login')}
              </Link>
              <Link to="/register"
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-medium">
                {t('nav.register')}
              </Link>
            </>
          )}

          {/* Desktop Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* Mobile: language + cart icon + hamburger */}
        <div className="md:hidden flex items-center gap-1.5">
          {isAuthenticated && isCustomer && (
            <Link
              to="/customer/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t('nav.close_menu') : t('nav.menu')}
            className="text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-600 rounded-md"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 space-y-3">
          <div className="pb-2 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">{t('nav.switch_language')}:</span>
            <LanguageSwitcher />
          </div>

          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700 font-medium">
            {t('nav.home')}
          </Link>
          <Link to="/mandi" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700 font-medium">
            {t('nav.mandi_rates')}
          </Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700 font-medium">
            {t('nav.browse')}
          </Link>

          {isAuthenticated ? (
            <>
              {isCustomer && (
                <>
                  <Link to="/customer/orders" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700 font-medium">
                    {t('nav.my_orders')}
                  </Link>
                  <Link to="/customer/addresses" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700 font-medium">
                    {t('checkout.delivery_address')}
                  </Link>
                </>
              )}
              <Link to={getDashboardPath(user.role)} onClick={() => setMenuOpen(false)}
                className="block text-gray-600 hover:text-green-700 font-medium">
                {t('nav.dashboard')}
              </Link>
              <div className="py-1">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role] || ''}`}>
                  {user.name} ({user.role})
                </span>
              </div>
              <button onClick={handleLogout}
                className="block w-full text-left text-red-600 hover:text-red-700 font-medium py-1">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2 border-t border-gray-100">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700 font-medium py-1">
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="block bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700 font-medium">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
