import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import { farmerOrderService } from '../../services/farmerOrderService';
import DashboardLayout from '../../components/DashboardLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import NoOrders from '../../components/illustrations/NoOrders';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, formatDate, formatDateTime, orderNumber } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function FarmerOrders() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('orders.incoming_orders_title')} | KisanMandi`);

  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Quick detail modal state
  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, summaryRes] = await Promise.all([
        farmerOrderService.list({
          status: statusFilter || undefined,
          page,
          size: PAGE_SIZE,
          sort: 'createdAt,desc',
        }),
        farmerOrderService.summary(),
      ]);
      setOrders(ordersRes.data?.content || []);
      setTotalPages(ordersRes.data?.totalPages || 0);
      setCounts(summaryRes.data || null);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleDirectAction = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      await farmerOrderService.updateStatus(orderId, newStatus, '');
      toast.success(t(`status.${newStatus}`));
      loadData();
      if (activeModalOrder && activeModalOrder.id === orderId) {
        // reload modal order
        const fresh = await farmerOrderService.get(orderId);
        setActiveModalOrder(fresh.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const openOrderModal = async (orderId) => {
    setModalLoading(true);
    try {
      const res = await farmerOrderService.get(orderId);
      setActiveModalOrder(res.data);
    } catch (err) {
      toast.error('Could not load order details');
    } finally {
      setModalLoading(false);
    }
  };

  // Status Pill Tabs
  const statusTabs = [
    { label: t('orders.all_orders'), value: '', count: counts?.total || 0 },
    { label: t('status.PLACED'), value: 'PLACED', count: counts?.placed || 0 },
    { label: t('status.ACCEPTED'), value: 'ACCEPTED', count: counts?.accepted || 0 },
    { label: t('status.PACKED'), value: 'PACKED', count: counts?.packed || 0 },
    { label: t('status.OUT_FOR_DELIVERY'), value: 'OUT_FOR_DELIVERY', count: counts?.outForDelivery || 0 },
    { label: t('status.DELIVERED'), value: 'DELIVERED', count: counts?.delivered || 0 },
  ];

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.dashboard'), to: '/farmer/dashboard' },
            { label: t('farmer.manage_orders') },
          ]}
          title={t('farmer.manage_orders')}
          subtitle="Review incoming customer orders, dispatch harvest, and collect cash on delivery."
        />

        {/* Sticky Status Pill Tabs */}
        <div className="sticky top-16 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#fafaf7]/95 backdrop-blur-md border-b border-neutral-200/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {statusTabs.map((tab) => {
              const isSelected = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleStatusFilterChange(tab.value)}
                  className={`
                    inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 min-h-[44px]
                    ${
                      isSelected
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-2xs font-extrabold ${
                        isSelected
                          ? 'bg-brand-900 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Cards Feed (Mobile-Optimized Cards on all screens) */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <ErrorState title={t('errors.generic_retry')} message={error} onRetry={loadData} />
        ) : orders.length === 0 ? (
          <EmptyState
            illustration={NoOrders}
            title={t('orders.no_orders')}
            message={
              statusFilter
                ? 'No orders found matching the selected status filter.'
                : 'Customer orders will appear here as soon as buyers checkout produce from your farm.'
            }
          />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {orders.map((order) => {
              const s = order.status;
              const isActionLoading = actionLoadingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4"
                >
                  {/* Top Bar: ID, Date & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-sm sm:text-base text-neutral-900">
                        {orderNumber(order.id)}
                      </span>
                      <span className="text-2xs sm:text-xs text-neutral-400 font-medium">
                        • {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <button
                        onClick={() => openOrderModal(order.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-700 hover:bg-brand-50 transition"
                        title="Quick View Timeline"
                        aria-label="View order timeline"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Customer Information & Delivery Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Name & Phone */}
                    <div className="space-y-1.5">
                      <p className="text-2xs font-bold text-neutral-400 uppercase tracking-wider">
                        {t('farmer.customer_name')}
                      </p>
                      <h4 className="text-base sm:text-lg font-extrabold text-neutral-900">
                        {order.otherPartyName || 'Buyer'}
                      </h4>

                      {order.otherPartyPhone && (
                        <a
                          href={`tel:${order.otherPartyPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-900 font-bold text-xs border border-brand-200 transition min-h-[38px]"
                        >
                          <Phone size={14} className="text-brand-700" />
                          <span>Call: {order.otherPartyPhone}</span>
                        </a>
                      )}
                    </div>

                    {/* Delivery Address snippet */}
                    <div className="space-y-1.5">
                      <p className="text-2xs font-bold text-neutral-400 uppercase tracking-wider">
                        Delivery Destination
                      </p>
                      <div className="flex items-start gap-1.5 text-xs sm:text-sm text-neutral-700">
                        <MapPin size={15} className="text-neutral-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {order.deliveryAddress || 'Address details in order file'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Line & Cash on Delivery Highlight */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Thumbnail & Name */}
                    <div className="flex items-center gap-3">
                      {order.firstItemImageUrl ? (
                        <img
                          src={order.firstItemImageUrl}
                          alt={order.firstItemName}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0">
                          <Package size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-sm text-neutral-900">
                          {order.firstItemName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {order.itemCount > 1
                            ? `and ${order.itemCount - 1} more items`
                            : 'Single item order'}
                        </p>
                      </div>
                    </div>

                    {/* "Collect Rs X (Cash)" Highlight */}
                    <div className="text-left sm:text-right">
                      <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider block">
                        Cash on Delivery
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-brand-900 font-mono tabular-nums">
                        Collect {formatINR(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Large Primary Action Buttons (Min 48px height) */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-neutral-100">
                    <Link
                      to={`/farmer/orders/${order.id}`}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-xl hover:bg-neutral-100 transition min-h-[44px]"
                    >
                      {t('orders.view_details')} <ChevronRight size={15} />
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      {s === 'PLACED' && (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            loading={isActionLoading}
                            onClick={() => handleDirectAction(order.id, 'ACCEPTED')}
                            className="flex-1 sm:flex-initial min-h-[48px]"
                          >
                            {t('farmer.accept_order')}
                          </Button>
                          <Button
                            variant="outline"
                            size="md"
                            loading={isActionLoading}
                            onClick={() => handleDirectAction(order.id, 'REJECTED')}
                            className="text-red-700 hover:bg-red-50 border-red-200 min-h-[48px]"
                          >
                            {t('farmer.reject_order')}
                          </Button>
                        </>
                      )}

                      {s === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="md"
                          loading={isActionLoading}
                          onClick={() => handleDirectAction(order.id, 'PACKED')}
                          className="w-full sm:w-auto min-h-[48px] bg-purple-700 hover:bg-purple-800"
                        >
                          {t('farmer.mark_packed')}
                        </Button>
                      )}

                      {s === 'PACKED' && (
                        <Button
                          variant="primary"
                          size="md"
                          loading={isActionLoading}
                          onClick={() => handleDirectAction(order.id, 'OUT_FOR_DELIVERY')}
                          className="w-full sm:w-auto min-h-[48px] bg-amber-600 hover:bg-amber-700 text-neutral-950 font-bold"
                        >
                          {t('farmer.mark_shipped')}
                        </Button>
                      )}

                      {s === 'OUT_FOR_DELIVERY' && (
                        <Button
                          variant="primary"
                          size="md"
                          loading={isActionLoading}
                          onClick={() => handleDirectAction(order.id, 'DELIVERED')}
                          className="w-full sm:w-auto min-h-[48px] bg-emerald-700 hover:bg-emerald-800"
                        >
                          {t('farmer.mark_delivered')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Quick Order Timeline Modal */}
        {activeModalOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setActiveModalOrder(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="font-extrabold text-lg text-neutral-900">
                    {orderNumber(activeModalOrder.id)}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Ordered by {activeModalOrder.customerName || 'Customer'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalOrder(null)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Timeline */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                <OrderTimeline
                  status={activeModalOrder.status}
                  history={activeModalOrder.history || []}
                />
              </div>

              {/* Action Footer */}
              <div className="pt-2 flex justify-between items-center">
                <Link
                  to={`/farmer/orders/${activeModalOrder.id}`}
                  className="text-xs font-bold text-brand-700 hover:underline"
                >
                  Open Full Order Page &rarr;
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModalOrder(null)}
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
