import React, { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Leaf,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  ClipboardList,
  ChevronDown,
  LayoutDashboard,
  Package,
  MapPin,
  TrendingUp,
  UserCheck,
  HelpCircle,
  Info,
  Home as HomeIcon,
  ShoppingBag,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, getDashboardPath } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import TextSizeControl from './ui/TextSizeControl';
import Button from './ui/Button';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const userButtonRef = useRef(null);
  const hamburgerButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuId = useId();

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click for user dropdown
  useEffect(() => {
    if (!userDropdownOpen) return;

    const handleOutsideClick = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [userDropdownOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      // Focus mobile menu container
      setTimeout(() => mobileMenuRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isFarmer = user?.role === 'FARMER';
  const isAdmin = user?.role === 'ADMIN';

  // Role badges
  const roleBadge = {
    FARMER: 'bg-green-100 text-green-800 border-green-200',
    CUSTOMER: 'bg-blue-100 text-blue-800 border-blue-200',
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 min-h-[44px] relative ${
      isActive
        ? 'text-green-900 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
        : 'text-stone-700 hover:text-green-800 hover:bg-stone-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors min-h-[56px] ${
      isActive
        ? 'text-green-900 bg-emerald-50 font-bold border border-emerald-200'
        : 'text-stone-700 hover:text-green-900 hover:bg-stone-50'
    }`;

  return (
    <header
      className={`
        sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-shadow duration-200
        border-b ${scrolled ? 'shadow-sm border-gray-200/80' : 'border-gray-200/60'}
      `}
    >
      <div className="page-container flex items-center justify-between h-14 md:h-16">
        {/* Brand */}
        <Link
          to="/"
          aria-label="KisanMandi Homepage"
          className="flex items-center gap-2.5 text-green-800 font-extrabold text-xl md:text-2xl tracking-tight shrink-0 focus-visible:outline-none"
        >
          <span className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-green-700 text-white flex items-center justify-center shadow-xs">
            <Leaf className="w-4 h-4 md:w-5 md:h-5" />
          </span>
          <span className="leading-none">KisanMandi</span>
        </Link>

        {/* Desktop Navigation Links (Icon + Word) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-1.5">
          <NavLink to="/" className={navLinkClass}>
            <HomeIcon className="w-4 h-4 shrink-0 text-green-700" aria-hidden="true" />
            <span>{t('nav.home', 'Home')}</span>
          </NavLink>
          <NavLink to="/mandi" className={navLinkClass}>
            <TrendingUp className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>{t('nav.mandi_rates', 'Mandi Rates')}</span>
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            <ShoppingBag className="w-4 h-4 shrink-0 text-green-700" aria-hidden="true" />
            <span>{t('nav.browse', 'Buy Produce')}</span>
          </NavLink>
          <NavLink to="/help" className={navLinkClass}>
            <HelpCircle className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{t('nav.help', 'Help')}</span>
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <Info className="w-4 h-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span>{t('nav.about', 'About')}</span>
          </NavLink>
        </nav>

        {/* Desktop Right items */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
          {/* Text Size Control */}
          <TextSizeControl variant="compact" />

          {/* Customer Cart */}
          {isAuthenticated && isCustomer && (
            <Link
              to="/customer/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative p-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-green-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Desktop Language Switcher (Dropdown) */}
          <LanguageSwitcher variant="dropdown" />

          {/* Logged Out / Logged In State */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button as={Link} to="/login" variant="ghost" size="md">
                {t('nav.login', 'Login')}
              </Button>
              <Button as={Link} to="/register" variant="primary" size="md">
                {t('nav.register', 'Register')}
              </Button>
            </div>
          ) : (
            /* User Dropdown */
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                id="user-menu-button"
                aria-haspopup="menu"
                aria-expanded={userDropdownOpen}
                aria-controls={userMenuId}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setUserDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-gray-200 bg-white hover:bg-green-50/70 hover:border-green-300 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-green-600"
              >
                {/* Avatar initial circle */}
                <div className="w-8 h-8 rounded-lg bg-green-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left text-xs leading-tight">
                  <span className="font-semibold text-gray-900 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {user?.role}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180 text-green-700' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {userDropdownOpen && (
                <div
                  ref={userDropdownRef}
                  id={userMenuId}
                  role="menu"
                  aria-labelledby="user-menu-button"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setUserDropdownOpen(false);
                      userButtonRef.current?.focus();
                    }
                  }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 p-2 z-50 text-sm space-y-1 transition-all"
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        roleBadge[user?.role] || ''
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>

                  <Link
                    to={getDashboardPath(user?.role)}
                    role="menuitem"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                  >
                    <LayoutDashboard size={16} className="text-green-700" />
                    <span>{t('nav.dashboard', 'Dashboard')}</span>
                  </Link>

                  {/* Customer role links */}
                  {isCustomer && (
                    <>
                      <Link
                        to="/customer/orders"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                      >
                        <ClipboardList size={16} className="text-gray-500" />
                        <span>{t('nav.my_orders', 'My Orders')}</span>
                      </Link>
                      <Link
                        to="/customer/addresses"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                      >
                        <MapPin size={16} className="text-gray-500" />
                        <span>{t('checkout.delivery_address', 'Delivery Address')}</span>
                      </Link>
                    </>
                  )}

                  {/* Farmer role links */}
                  {isFarmer && (
                    <>
                      <Link
                        to="/farmer/products"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                      >
                        <Package size={16} className="text-gray-500" />
                        <span>{t('nav.my_products', 'My Products')}</span>
                      </Link>
                      <Link
                        to="/farmer/orders"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                      >
                        <ClipboardList size={16} className="text-gray-500" />
                        <span>{t('nav.incoming_orders', 'Orders')}</span>
                      </Link>
                      <Link
                        to="/farmer/mandi"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                      >
                        <TrendingUp size={16} className="text-gray-500" />
                        <span>{t('nav.mandi_rates', 'Mandi Rates')}</span>
                      </Link>
                    </>
                  )}

                  {/* Admin role links */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/farmers"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                      >
                        <UserCheck size={16} className="text-gray-500" />
                        <span>{t('nav.admin', 'Farmer Approvals')}</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/about"
                    role="menuitem"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors font-medium min-h-[40px]"
                  >
                    <Info size={16} className="text-blue-600" />
                    <span>{t('nav.about', 'About Project')}</span>
                  </Link>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium min-h-[40px]"
                    >
                      <LogOut size={16} />
                      <span>{t('nav.logout', 'Logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile controls (Cart + Hamburger) */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && isCustomer && (
            <Link
              to="/customer/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative p-2 rounded-xl text-gray-700 hover:text-green-800 hover:bg-green-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          <button
            ref={hamburgerButtonRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t('nav.close_menu', 'Close Menu') : t('nav.menu', 'Menu')}
            aria-expanded={menuOpen}
            className="p-2.5 rounded-xl text-gray-700 hover:text-green-800 hover:bg-gray-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-green-600"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Backdrop mounted to document.body via portal */}
      {menuOpen && typeof document !== 'undefined' && createPortal(
        <div className="md:hidden fixed inset-0 top-14 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-14 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            ref={mobileMenuRef}
            tabIndex={-1}
            className="relative w-full bg-white border-b border-gray-200 shadow-xl px-5 py-6 space-y-5 max-h-[calc(100vh-3.5rem)] overflow-y-auto outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMenuOpen(false);
                hamburgerButtonRef.current?.focus();
              }
            }}
          >
            {/* Language & Text Size Controls with Big Labels */}
            <div className="pb-4 border-b border-gray-100 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {t('common.language', 'Language')}
                </p>
                <LanguageSwitcher variant="segmented" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {t('common.text_size', 'Text size')}
                </p>
                <TextSizeControl variant="full" />
              </div>
            </div>

            {/* Navigation Links (Icon + Word, min 48px height) */}
            <nav aria-label="Mobile Navigation" className="space-y-1">
              <NavLink to="/" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
                <HomeIcon size={18} className="text-green-700" />
                <span>{t('nav.home', 'Home')}</span>
              </NavLink>
              <NavLink to="/mandi" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
                <TrendingUp size={18} className="text-amber-600" />
                <span>{t('nav.mandi_rates', 'Mandi Rates')}</span>
              </NavLink>
              <NavLink to="/products" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
                <ShoppingBag size={18} className="text-green-700" />
                <span>{t('nav.browse', 'Buy Produce')}</span>
              </NavLink>
              <NavLink to="/help" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
                <HelpCircle size={18} className="text-emerald-600" />
                <span>{t('nav.help', 'Help')}</span>
              </NavLink>
              <NavLink to="/about" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
                <Info size={18} className="text-blue-600" />
                <span>{t('nav.about', 'About')}</span>
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to={getDashboardPath(user?.role)}
                  onClick={() => setMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <LayoutDashboard size={18} className="text-green-700" />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                </NavLink>
              )}

              {isAuthenticated && isCustomer && (
                <>
                  <NavLink
                    to="/customer/orders"
                    onClick={() => setMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    <ClipboardList size={18} />
                    <span>{t('nav.my_orders', 'My Orders')}</span>
                  </NavLink>
                  <NavLink
                    to="/customer/addresses"
                    onClick={() => setMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    <MapPin size={18} />
                    <span>{t('checkout.delivery_address', 'Delivery Address')}</span>
                  </NavLink>
                </>
              )}

              {isAuthenticated && isFarmer && (
                <>
                  <NavLink
                    to="/farmer/products"
                    onClick={() => setMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    <Package size={18} />
                    <span>{t('nav.my_products', 'My Products')}</span>
                  </NavLink>
                  <NavLink
                    to="/farmer/orders"
                    onClick={() => setMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    <ClipboardList size={18} />
                    <span>{t('nav.incoming_orders', 'Orders')}</span>
                  </NavLink>
                </>
              )}
            </nav>

            {/* Mobile Auth / Profile section */}
            <div className="pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-green-700 text-white font-bold flex items-center justify-center">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">{user?.name}</p>
                      <p className="text-xs text-gray-500 leading-tight">{user?.email}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          roleBadge[user?.role] || ''
                        }`}
                      >
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    fullWidth
                    leftIcon={<LogOut size={16} />}
                    onClick={handleLogout}
                  >
                    {t('nav.logout', 'Logout')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button as={Link} to="/login" variant="outline" size="lg" fullWidth onClick={() => setMenuOpen(false)}>
                    {t('nav.login', 'Login')}
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="lg" fullWidth onClick={() => setMenuOpen(false)}>
                    {t('nav.register', 'Register')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
