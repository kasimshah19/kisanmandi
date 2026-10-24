import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  Star,
  Calendar,
  Store,
  CheckCircle2,
  Package,
  Truck,
  Banknote,
  X,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderStatusBadge, { StatusPill } from '../../components/OrderStatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import NoOrders from '../../components/illustrations/NoOrders';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, formatDate } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import { isActiveStatus } from '../../utils/orderStatus';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function MyOrders() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('orders.my_orders_title')} | KisanMandi`);

  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabKey, setActiveTabKey] = useState('ALL');

  // Success modal from checkout redirect
  const justPlaced = location.state?.justPlacedOrder;
  const [showSuccessModal, setShowSuccessModal] = useState(!!justPlaced);

  useEffect(() => {
    loadOrders();
  }, [page, activeTabKey]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // If activeTabKey is specific backend status, filter by it; for RUNNING we filter client-side
      const apiStatus =
        activeTabKey === 'DELIVERED'
          ? 'DELIVERED'
          : activeTabKey === 'CANCELLED'
          ? 'CANCELLED'
          : undefined;

      const res = await orderService.list({
        status: apiStatus,
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc'
      });
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayedOrders =
    activeTabKey === 'RUNNING'
      ? orders.filter((o) => isActiveStatus(o.status))
      : orders;

  const runningCount = orders.filter((o) => isActiveStatus(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED').length;

  const tabs = [
    { key: 'ALL', label: t('orders.tab_all'), count: orders.length },
    { key: 'RUNNING', label: t('orders.tab_running'), count: runningCount },
    { key: 'DELIVERED', label: t('orders.tab_delivered'), count: deliveredCount },
    { key: 'CANCELLED', label: t('orders.tab_cancelled'), count: cancelledCount }
  ];

  const getStatusBorderClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'border-l-6 border-l-green-600';
      case 'OUT_FOR_DELIVERY':
        return 'border-l-6 border-l-amber-500';
      case 'ACCEPTED':
      case 'PACKED':
        return 'border-l-6 border-l-blue-600';
      case 'PLACED':
        return 'border-l-6 border-l-green-500';
      case 'CANCELLED':
      case 'REJECTED':
        return 'border-l-6 border-l-red-500';
      default:
        return 'border-l-6 border-l-neutral-300';
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // clear navigation state so modal doesn't pop up again on refresh
    navigate(location.pathname, { replace: true, state: {} });
  };

  const justPlacedId = justPlaced?.id ? `KM-${String(justPlaced.id).padStart(5, '0')}` : 'KM-NEW';

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container max-w-5xl space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('orders.my_orders_title') }
          ]}
          title={t('orders.my_orders_title')}
          subtitle={t('orders.my_orders_subtitle')}
        />

        {/* ORDER SUCCESS MODAL / BANNER (Shown directly on /customer/orders without route-change) */}
        {showSuccessModal && justPlaced && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/90 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={closeSuccessModal}
                aria-label={t('common.close')}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-3">
                {/* Animated check (reduced-motion safe) */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center ring-8 ring-green-50 motion-safe:scale-105 transition">
                  <CheckCircle2 size={42} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 id="success-title" className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                    {t('checkout.order_success_title')}
                  </h2>
                  <p className="text-sm font-bold text-green-800 bg-green-50 px-3 py-1 rounded-full inline-block mt-2 font-mono">
                    {justPlacedId}
                  </p>
                </div>
              </div>

              {/* What happens next in 3 plain steps */}
              <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 space-y-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600">
                  {t('orders.what_happens_next')}
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-neutral-700">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">{t('checkout.order_success_step1')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">{t('checkout.order_success_step2')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">{t('checkout.order_success_step3')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Track my order & Keep shopping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  as={Link}
                  to={`/customer/orders/${justPlaced.id}`}
                  onClick={closeSuccessModal}
                  variant="primary"
                  size="lg"
                  className="w-full text-sm sm:text-base font-extrabold shadow-md"
                >
                  <Package size={17} className="mr-1.5" />
                  <span>{t('checkout.view_order_btn')}</span>
                </Button>
                <Button
                  as={Link}
                  to="/products"
                  onClick={closeSuccessModal}
                  variant="outline"
                  size="lg"
                  className="w-full text-sm sm:text-base font-bold"
                >
                  <ShoppingBag size={17} className="mr-1.5" />
                  <span>{t('checkout.keep_shopping')}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Big Pill Tabs */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 my-6 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTabKey === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTabKey(tab.key);
                  setPage(0);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition min-h-[44px] flex items-center gap-2 ${
                  isActive
                    ? 'bg-green-800 text-white shadow-md'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto py-8">
            <ErrorState title={t('errors.generic_retry')} message={error} onRetry={loadOrders} />
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="max-w-lg mx-auto py-8">
            <EmptyState
              illustration={NoOrders}
              title={t('orders.no_orders')}
              message={t('orders.no_orders_desc')}
              action={
                <Button as={Link} to="/products" variant="primary">
                  {t('nav.browse')}
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map((order) => {
              const kmId = `KM-${String(order.id).padStart(5, '0')}`;
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl border border-neutral-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden ${getStatusBorderClass(
                    order.status
                  )}`}
                >
                  {/* Order Top Bar */}
                  <div className="px-5 sm:px-6 py-3.5 bg-neutral-50/70 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          {t('orders.order_no')}
                        </span>
                        <span className="font-extrabold text-neutral-900 font-mono text-sm">
                          {kmId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          {t('orders.timeline_placed')}
                        </span>
                        <span className="font-semibold text-neutral-800 flex items-center gap-1">
                          <Calendar size={13} className="text-neutral-400" />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          {t('common.total')}
                        </span>
                        <span className="font-black text-green-800 tabular-nums text-sm">
                          {formatINR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.canReview && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-bold">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          {t('orders.rate_now')}
                        </span>
                      )}
                      <StatusPill status={order.status} size="sm" />
                    </div>
                  </div>

                  {/* Order Card Body */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* First item thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-100 border border-neutral-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {order.firstItemImageUrl ? (
                          <img
                            src={getOptimizedImageUrl(order.firstItemImageUrl, 160)}
                            alt={order.firstItemName || 'Produce item'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-sm text-neutral-400 font-bold">
                            {(order.firstItemName || 'P')[0]}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg truncate">
                          {order.firstItemName}
                        </h3>
                        {order.itemCount > 1 && (
                          <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                            {t('orders.more_items', { count: order.itemCount - 1 })}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-green-900 bg-green-50 border border-green-200/70 px-2.5 py-1 rounded-full mt-2 inline-flex items-center gap-1">
                          <Store size={12} className="text-green-700" />
                          {t('orders.sold_by', { name: order.otherPartyName })}
                        </p>
                      </div>
                    </div>

                    {/* Big "See Details" Button */}
                    <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <Button
                        as={Link}
                        to={`/customer/orders/${order.id}`}
                        variant="primary"
                        size="md"
                        className="w-full sm:w-auto font-black text-sm px-5 py-2.5 rounded-2xl shadow-xs"
                      >
                        <span>{t('orders.view_details')}</span>
                        <ChevronRight size={17} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
