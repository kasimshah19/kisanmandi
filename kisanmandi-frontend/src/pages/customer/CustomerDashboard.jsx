import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  MapPin,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/phase5Services';
import IconTile from '../../components/ui/IconTile';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatINR, formatDate } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cartCount } = useCart();
  useDocumentTitle(`${t('nav.dashboard')} | KisanMandi`);

  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const firstName =
    user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Friend';

  useEffect(() => {
    // Load 3 recent orders
    orderService
      .list({ page: 0, size: 3, sort: 'createdAt,desc' })
      .then((res) => setRecentOrders(res.data?.content || []))
      .catch(() => setRecentOrders([]))
      .finally(() => setLoadingOrders(false));

    // Load pending reviews
    reviewService
      .getPendingReviews()
      .then((res) => setPendingReviews(res || []))
      .catch(() => setPendingReviews([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container max-w-5xl space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-6 sm:p-10 text-white shadow-md">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-200 text-xs font-semibold">
              <Sparkles size={13} className="text-amber-400" />
              <span>Direct Farm-to-Kitchen</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t('customer.welcome_back', { name: firstName })}
            </h1>
            <p className="text-brand-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              {t('customer.dashboard_subtitle')}
            </p>
          </div>

          {/* Decorative background glow */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        </div>

        {/* 4 Quick Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Browse */}
          <Link
            to="/products"
            className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <IconTile icon={ShoppingBag} tone="green" size="md" />
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                  Produce
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 text-base mb-1 group-hover:text-brand-800 transition">
                {t('customer.browse_produce_title')}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {t('customer.browse_produce_desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-xs font-bold text-brand-700 group-hover:translate-x-1 transition">
              {t('customer.shop_now')} <ArrowRight size={14} className="ml-1" />
            </div>
          </Link>

          {/* Cart */}
          <Link
            to="/customer/cart"
            className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <IconTile icon={ShoppingCart} tone="amber" size="md" />
                {cartCount > 0 ? (
                  <Badge variant="brand" size="sm">
                    {cartCount} in cart
                  </Badge>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400">Empty</span>
                )}
              </div>
              <h3 className="font-bold text-neutral-900 text-base mb-1 group-hover:text-brand-800 transition">
                {t('customer.cart_tile_title')}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {t('customer.cart_tile_desc', { count: cartCount || 0 })}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition">
              {t('nav.cart')} <ArrowRight size={14} className="ml-1" />
            </div>
          </Link>

          {/* My Orders */}
          <Link
            to="/customer/orders"
            className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <IconTile icon={Package} tone="blue" size="md" />
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Tracking
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 text-base mb-1 group-hover:text-blue-800 transition">
                {t('customer.my_orders_title')}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {t('customer.my_orders_desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition">
              {t('customer.view_orders')} <ArrowRight size={14} className="ml-1" />
            </div>
          </Link>

          {/* Addresses */}
          <Link
            to="/customer/addresses"
            className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <IconTile icon={MapPin} tone="gray" size="md" />
                <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                  Saved
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 text-base mb-1 group-hover:text-neutral-900 transition">
                {t('customer.addresses_title')}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {t('customer.addresses_desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-xs font-bold text-neutral-700 group-hover:translate-x-1 transition">
              {t('customer.manage')} <ArrowRight size={14} className="ml-1" />
            </div>
          </Link>
        </div>

        {/* Dashboard 2-Column Content: Recent Orders (3) + Pending Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Recent Orders (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Package size={18} className="text-brand-700" />
                {t('customer.recent_orders_title')}
              </h2>
              <Link
                to="/customer/orders"
                className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-0.5"
              >
                {t('customer.view_all_orders')}
                <ChevronRight size={14} />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="space-y-3">
                <div className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-neutral-500">{t('customer.no_recent_orders')}</p>
                <Button as={Link} to="/products" variant="outline" size="sm">
                  {t('nav.browse')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const kmId = `KM-${String(order.id).padStart(5, '0')}`;
                  return (
                    <Link
                      key={order.id}
                      to={`/customer/orders/${order.id}`}
                      className="p-3.5 rounded-2xl border border-neutral-200/80 hover:border-brand-300 hover:bg-neutral-50/50 transition flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-neutral-900 text-xs font-mono">
                            {kmId}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs font-bold text-neutral-800 truncate mt-1">
                          {order.firstItemName}
                          {order.itemCount > 1 && ` + ${order.itemCount - 1} more`}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {formatDate(order.createdAt)} • {order.otherPartyName}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-brand-800 text-sm block tabular-nums">
                          {formatINR(order.totalAmount)}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-700 group-hover:translate-x-0.5 transition inline-flex items-center">
                          Track &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Reviews Card (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                {t('customer.pending_reviews_title')}
              </h2>
              {pendingReviews.length > 0 && (
                <Badge variant="warning" size="sm">
                  {pendingReviews.length} pending
                </Badge>
              )}
            </div>

            {pendingReviews.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-brand-50/30 border border-brand-100 space-y-2">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
                  <Star size={18} className="fill-brand-600" />
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                  {t('customer.no_pending_reviews')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((rev) => (
                  <div
                    key={rev.orderId}
                    className="p-3.5 rounded-2xl border border-amber-200/70 bg-amber-50/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {rev.farmerName || 'Local Farmer'}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Order #{rev.orderId} • Delivered
                      </p>
                    </div>
                    <Button
                      as={Link}
                      to={`/customer/orders/${rev.orderId}`}
                      variant="primary"
                      size="sm"
                      className="text-xs shrink-0"
                    >
                      {t('orders.rate_now')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
