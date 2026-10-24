import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCircle,
  Package,
  PlusCircle,
  Users,
  Tags,
  Menu,
  X,
  Tractor,
  ClipboardList,
  Database,
  DollarSign,
  Star,
  MessageSquare,
  LogOut,
  ChevronRight,
  MoreHorizontal,
  Sprout,
  Shield,
  HelpCircle
} from 'lucide-react';
import { farmerOrderService } from '../services/farmerOrderService';
import LanguageSwitcher from './LanguageSwitcher';
import TextSizeControl from './ui/TextSizeControl';
import Badge from './ui/Badge';

export default function DashboardLayout({ children, role }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [placedCount, setPlacedCount] = useState(0);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch PLACED count for farmer sidebar badge
  useEffect(() => {
    if (role === 'FARMER') {
      farmerOrderService
        .summary()
        .then((res) => setPlacedCount(res.data?.placed || 0))
        .catch(() => {});
    }
  }, [role, location.pathname]);

  const farmerLinks = [
    { name: t('nav.dashboard'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: t('farmer.manage_orders'), path: '/farmer/orders', icon: ClipboardList, badge: placedCount },
    { name: t('farmer.manage_products'), path: '/farmer/products', icon: Package },
    { name: t('farmer.add_new_product'), path: '/farmer/products/add', icon: PlusCircle },
    { name: t('nav.earnings'), path: '/farmer/earnings', icon: DollarSign },
    { name: t('nav.reviews'), path: '/farmer/reviews', icon: Star },
    { name: t('nav.mandi_rates'), path: '/farmer/mandi', icon: Tractor },
    { name: t('farmer.my_profile'), path: '/farmer/profile', icon: UserCircle },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Farmer Approvals', path: '/admin/farmers', icon: Users },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Mandi Sync Logs', path: '/admin/mandi-sync', icon: Database },
  ];

  const links = role === 'ADMIN' ? adminLinks : farmerLinks;

  // Farmers bottom navigation shortcuts: 4 big items
  const farmerBottomNav = [
    { name: t('nav.dashboard'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: t('farmer.manage_orders'), path: '/farmer/orders', icon: ClipboardList, badge: placedCount },
    { name: t('farmer.manage_products'), path: '/farmer/products', icon: Package },
    { name: t('nav.mandi_rates'), path: '/farmer/mandi', icon: Tractor },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (role === 'ADMIN' ? 'A' : 'F');

  const renderNavLinks = (onClickItem = () => {}) => (
    <nav className="p-3 space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          location.pathname === link.path ||
          (link.path !== '/farmer/dashboard' &&
            link.path !== '/admin/dashboard' &&
            location.pathname.startsWith(link.path));

        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onClickItem}
            className={`
              relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group min-h-[44px]
              ${
                isActive
                  ? 'bg-brand-50 text-brand-900 font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-brand-700 before:rounded-r-full shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
              }
            `}
          >
            <Icon
              size={19}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-brand-700' : 'text-neutral-400 group-hover:text-neutral-700'
              }`}
            />
            <span className="flex-1 truncate">{link.name}</span>
            {link.badge > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white shrink-0 animate-pulse">
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row text-neutral-900 antialiased">
      {/* DESKTOP FIXED SIDEBAR (256px / w-64) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200/90 fixed left-0 top-0 bottom-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-neutral-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-xs transition group-hover:scale-105">
              <Sprout size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-neutral-900 leading-none block">
                KisanMandi
              </span>
              <span className="text-2xs font-bold text-brand-700 uppercase tracking-wider block mt-0.5">
                {role === 'ADMIN' ? 'Admin Portal' : 'Farmer Studio'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-2">
          {renderNavLinks()}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3.5 border-t border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-bold text-xs flex items-center justify-center shrink-0 border border-brand-200">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {user?.name || (role === 'ADMIN' ? 'Administrator' : 'Farmer')}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={role === 'ADMIN' ? 'danger' : 'brand'} size="sm">
                    {role}
                  </Badge>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
          {/* Left: Mobile hamburger & breadcrumb hint */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open sidebar menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden sm:inline">
                {role === 'ADMIN' ? 'Admin' : 'Farmer'}
              </span>
              <span className="text-xs text-neutral-300 hidden sm:inline">•</span>
              <h2 className="text-sm sm:text-base font-bold text-neutral-800 truncate">
                {links.find((l) => location.pathname === l.path)?.name ||
                  (role === 'ADMIN' ? 'Admin Panel' : t('farmer.dashboard_title'))}
              </h2>
            </div>
          </div>

          {/* Right: Language switcher & TextSizeControl & User avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {role === 'FARMER' && (
              <>
                <LanguageSwitcher variant="dropdown" />
                <TextSizeControl variant="compact" />
              </>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-800 font-bold text-xs flex items-center justify-center border border-brand-200 shadow-2xs">
                {userInitial}
              </div>
              <span className="text-xs font-semibold text-neutral-700 hidden md:inline truncate max-w-[120px]">
                {user?.name || (role === 'ADMIN' ? 'Admin' : 'Farmer')}
              </span>
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER (Off-canvas sidebar) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Header */}
            <div className="h-16 px-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                  <Sprout size={18} />
                </div>
                <span className="font-extrabold text-base tracking-tight text-neutral-900">
                  KisanMandi
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('common.close')}
              >
                <X size={19} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-2 divide-y divide-neutral-100">
              {/* Primary links */}
              <div>
                {renderNavLinks(() => setIsDrawerOpen(false))}
              </div>

              {/* Farmer Extra quick links (Profile, Earnings, Reviews, Help) */}
              {role === 'FARMER' && (
                <div className="p-3 space-y-1">
                  <Link
                    to="/help"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 transition min-h-[44px]"
                  >
                    <HelpCircle size={19} className="text-neutral-400" />
                    <span>{t('nav.help', 'Help & Support')}</span>
                  </Link>

                  {/* Settings section: Language & Text Size */}
                  <div className="pt-3 px-2 space-y-3">
                    <div>
                      <p className="text-2xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        {t('common.language', 'Language')}
                      </p>
                      <LanguageSwitcher variant="buttons" />
                    </div>

                    <div>
                      <p className="text-2xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        {t('text_size.label', 'Text Size')}
                      </p>
                      <TextSizeControl variant="full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer with User & Logout */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-bold text-xs flex items-center justify-center shrink-0 border border-brand-200">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {user?.name || (role === 'ADMIN' ? 'Administrator' : 'Farmer')}
                  </p>
                  <p className="text-2xs text-neutral-500 truncate">{user?.phone || user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition min-h-[44px]"
              >
                <LogOut size={16} />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR FOR FARMERS */}
      {role === 'FARMER' && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-2 flex items-center justify-around shadow-lg"
        >
          {farmerBottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[50px] min-w-[56px]
                  ${isActive ? 'text-brand-800 font-bold' : 'text-neutral-500 hover:text-neutral-800'}
                `}
              >
                <div className="relative">
                  <Icon size={22} className={isActive ? 'text-brand-700 stroke-[2.2]' : 'text-neutral-500'} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-2xs font-extrabold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-2xs font-semibold mt-1 truncate max-w-[68px]">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* More action button opening drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-neutral-500 hover:text-neutral-800 transition-all min-h-[50px] min-w-[56px]"
            aria-label={t('common.more', 'More options')}
          >
            <MoreHorizontal size={22} />
            <span className="text-2xs font-semibold mt-1">{t('common.more', 'More')}</span>
          </button>
        </nav>
      )}
    </div>
  );
}
