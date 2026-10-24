import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  Eye,
  X,
  AlertCircle,
  Check
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
import BottomSheet from '../../components/ui/BottomSheet';
import ConfirmDialog from '../../components/ConfirmDialog';
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

  // Tab filter: 'NEW', 'IN_PROGRESS', 'DONE', or '' (All)
  const [activeGroup, setActiveGroup] = useState('NEW');
  const [specificStatus, setSpecificStatus] = useState('PLACED');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Quick detail BottomSheet
  const [sheetOrder, setSheetOrder] = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  // Rejection modal state
  const [rejectionTargetId, setRejectionTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Delivered cash confirmation state
  const [deliveryConfirmOrder, setDeliveryConfirmOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, [page, specificStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, summaryRes] = await Promise.all([
        farmerOrderService.list({
          status: specificStatus || undefined,
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

  const handleGroupSelect = (group) => {
    setActiveGroup(group);
    setPage(0);
    if (group === 'NEW') setSpecificStatus('PLACED');
    else if (group === 'IN_PROGRESS') setSpecificStatus('ACCEPTED');
    else if (group === 'DONE') setSpecificStatus('DELIVERED');
    else setSpecificStatus('');
  };

  const handleExecuteStatusChange = async (orderId, newStatus, note = '') => {
    setActionLoadingId(orderId);
    try {
      await farmerOrderService.updateStatus(orderId, newStatus, note);
      toast.success(t(`status.${newStatus}`, newStatus));
      loadData();
      if (sheetOrder && sheetOrder.id === orderId) {
        const fresh = await farmerOrderService.get(orderId);
        setSheetOrder(fresh.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionTargetId) return;
    const note = rejectionReason.trim() || 'Produce unavailable / cannot fulfill at this time';
    await handleExecuteStatusChange(rejectionTargetId, 'REJECTED', note);
    setRejectionTargetId(null);
    setRejectionReason('');
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryConfirmOrder) return;
    await handleExecuteStatusChange(deliveryConfirmOrder.id, 'DELIVERED', 'Cash collected');
    setDeliveryConfirmOrder(null);
  };

  const openOrderSheet = async (orderId) => {
    setSheetLoading(true);
    try {
      const res = await farmerOrderService.get(orderId);
      setSheetOrder(res.data);
    } catch {
      toast.error('Could not load order details');
    } finally {
      setSheetLoading(false);
    }
  };

  const newCount = counts?.placed || 0;
  const inProgressCount =
    (counts?.accepted || 0) + (counts?.packed || 0) + (counts?.outForDelivery || 0);
  const doneCount = (counts?.delivered || 0) + (counts?.cancelled || 0) + (counts?.rejected || 0);
  const allCount = counts?.total || 0;

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

        {/* Sticky Status Pill Tabs ("New", "In progress", "Done") */}
        <div className="sticky top-16 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#fafaf7]/95 backdrop-blur-md border-b border-neutral-200/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* New Orders Pill */}
            <button
              type="button"
              onClick={() => handleGroupSelect('NEW')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all shrink-0 min-h-[46px] ${
                activeGroup === 'NEW'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200/90 hover:bg-neutral-50'
              }`}
            >
              <span>{t('orders.tab_new', 'New')}</span>
              {newCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeGroup === 'NEW' ? 'bg-brand-900 text-white' : 'bg-red-600 text-white animate-pulse'
                  }`}
                >
                  {newCount}
                </span>
              )}
            </button>

            {/* In Progress Orders Pill */}
            <button
              type="button"
              onClick={() => handleGroupSelect('IN_PROGRESS')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all shrink-0 min-h-[46px] ${
                activeGroup === 'IN_PROGRESS'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200/90 hover:bg-neutral-50'
              }`}
            >
              <span>{t('orders.tab_in_progress', 'In progress')}</span>
              {inProgressCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeGroup === 'IN_PROGRESS' ? 'bg-brand-900 text-white' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {inProgressCount}
                </span>
              )}
            </button>

            {/* Done Orders Pill */}
            <button
              type="button"
              onClick={() => handleGroupSelect('DONE')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all shrink-0 min-h-[46px] ${
                activeGroup === 'DONE'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200/90 hover:bg-neutral-50'
              }`}
            >
              <span>{t('orders.tab_done', 'Done')}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeGroup === 'DONE' ? 'bg-brand-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {doneCount}
              </span>
            </button>

            {/* All Orders Pill */}
            <button
              type="button"
              onClick={() => handleGroupSelect('ALL')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 min-h-[46px] ${
                activeGroup === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/90 hover:bg-neutral-50'
              }`}
            >
              <span>{t('orders.all_orders', 'All')}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-2xs font-extrabold ${
                  activeGroup === 'ALL' ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {allCount}
              </span>
            </button>
          </div>

          {/* Sub-status filter if in progress */}
          {activeGroup === 'IN_PROGRESS' && (
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
              {[
                { label: 'Accepted', val: 'ACCEPTED' },
                { label: 'Packed', val: 'PACKED' },
                { label: 'Out for delivery', val: 'OUT_FOR_DELIVERY' },
              ].map((sub) => (
                <button
                  key={sub.val}
                  type="button"
                  onClick={() => {
                    setSpecificStatus(sub.val);
                    setPage(0);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition min-h-[32px] ${
                    specificStatus === sub.val
                      ? 'bg-brand-100 text-brand-900 border border-brand-300'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Cards Feed */}
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
              activeGroup === 'NEW'
                ? 'No new orders right now. New customer requests will ring here.'
                : 'No orders found matching this tab.'
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
                        type="button"
                        onClick={() => openOrderSheet(order.id)}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-brand-700 hover:bg-brand-50 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="View order details and timeline"
                        aria-label="View order timeline"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Customer Information & Big Call Button */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Name & Big Green Call Button */}
                    <div className="space-y-2">
                      <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider block">
                        {t('farmer.customer_name', 'Customer')}
                      </span>
                      <h4 className="text-lg sm:text-xl font-extrabold text-neutral-900">
                        {order.otherPartyName || 'Buyer'}
                      </h4>

                      {order.otherPartyPhone ? (
                        <a
                          href={`tel:${order.otherPartyPhone}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xs transition min-h-[46px]"
                        >
                          <Phone size={17} className="stroke-[2.5]" />
                          <span>Call: {order.otherPartyPhone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">No phone listed</span>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1.5">
                      <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider block">
                        Delivery Destination
                      </span>
                      <div className="flex items-start gap-2 text-sm text-neutral-700">
                        <MapPin size={17} className="text-brand-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 font-medium">
                          {order.deliveryAddress || 'Doorstep delivery'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Produce Item Snippet & Highlighted Cash on Delivery */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {order.firstItemImageUrl ? (
                        <img
                          src={order.firstItemImageUrl}
                          alt={order.firstItemName}
                          className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0">
                          <Package size={22} />
                        </div>
                      )}
                      <div>
                        <h5 className="font-extrabold text-base text-neutral-900">
                          {order.firstItemName}
                        </h5>
                        <p className="text-xs text-neutral-500 font-medium">
                          {order.itemCount > 1
                            ? `and ${order.itemCount - 1} more crops`
                            : 'Direct farm produce'}
                        </p>
                      </div>
                    </div>

                    {/* Prominent Collect Cash Box */}
                    <div className="p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left sm:text-right">
                      <span className="text-2xs font-extrabold text-emerald-800 uppercase tracking-wider block">
                        Cash on Delivery
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono tabular-nums">
                        Collect {formatINR(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* ONE Big Primary Action in Plain Words */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => openOrderSheet(order.id)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-xl hover:bg-neutral-100 transition min-h-[44px]"
                    >
                      <span>{t('orders.view_details', 'View details & tracker')}</span>
                      <ChevronRight size={15} />
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {s === 'PLACED' && (
                        <>
                          <Button
                            variant="primary"
                            size="lg"
                            loading={isActionLoading}
                            onClick={() => handleExecuteStatusChange(order.id, 'ACCEPTED')}
                            className="flex-1 sm:flex-initial min-h-[50px] px-6 font-extrabold bg-brand-700 hover:bg-brand-800 shadow-sm"
                          >
                            <Check size={18} className="stroke-[3]" />
                            <span>{t('farmer.accept_order', 'Accept order')}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            loading={isActionLoading}
                            onClick={() => setRejectionTargetId(order.id)}
                            className="min-h-[50px] text-red-700 hover:bg-red-50 border-red-300 font-bold"
                          >
                            <XCircle size={18} />
                            <span>{t('farmer.cannot_take_it', 'Cannot take it')}</span>
                          </Button>
                        </>
                      )}

                      {s === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="lg"
                          loading={isActionLoading}
                          onClick={() => handleExecuteStatusChange(order.id, 'PACKED')}
                          className="w-full sm:w-auto min-h-[50px] px-8 font-extrabold bg-purple-700 hover:bg-purple-800 shadow-sm"
                        >
                          <Package size={18} />
                          <span>{t('farmer.mark_packed', 'Packed')}</span>
                        </Button>
                      )}

                      {s === 'PACKED' && (
                        <Button
                          variant="primary"
                          size="lg"
                          loading={isActionLoading}
                          onClick={() => handleExecuteStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                          className="w-full sm:w-auto min-h-[50px] px-8 font-extrabold bg-amber-600 hover:bg-amber-700 text-neutral-950 shadow-sm"
                        >
                          <Truck size={18} />
                          <span>{t('farmer.mark_shipped', 'Out for delivery')}</span>
                        </Button>
                      )}

                      {s === 'OUT_FOR_DELIVERY' && (
                        <Button
                          variant="primary"
                          size="lg"
                          loading={isActionLoading}
                          onClick={() => setDeliveryConfirmOrder(order)}
                          className="w-full sm:w-auto min-h-[50px] px-8 font-extrabold bg-emerald-700 hover:bg-emerald-800 shadow-sm"
                        >
                          <CheckCircle2 size={18} />
                          <span>{t('farmer.mark_delivered', 'Delivered: I got the cash')}</span>
                        </Button>
                      )}

                      {s === 'DELIVERED' && (
                        <Badge variant="success" size="md" className="font-extrabold py-2 px-3">
                          ✓ {t('status.DELIVERED', 'Delivered & Cash Collected')}
                        </Badge>
                      )}

                      {(s === 'CANCELLED' || s === 'REJECTED') && (
                        <Badge variant="danger" size="md" className="font-bold py-2 px-3">
                          {t(`status.${s}`, s)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Rejection Reason Modal */}
        {rejectionTargetId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="font-extrabold text-lg text-neutral-900">
                  {t('farmer.cannot_take_it', 'Cannot take this order')}
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectionTargetId(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-neutral-600">
                Please pick a reason or leave a note so the buyer understands:
              </p>

              <div className="space-y-2">
                {[
                  'Crop ran out of stock',
                  'Harvest not ready today',
                  'Delivery location is too far',
                  'Other reason',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition ${
                      rejectionReason === preset
                        ? 'border-brand-700 bg-brand-50 text-brand-950'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}

                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Or type a custom note here..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setRejectionTargetId(null)}
                  className="font-bold"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmRejection}
                  className="bg-red-700 hover:bg-red-800 text-white font-extrabold"
                >
                  Confirm Decline
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Confirmation Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deliveryConfirmOrder)}
          title="Delivered: Confirm Cash Collection"
          message={`Did you collect ${formatINR(deliveryConfirmOrder?.totalAmount || 0)} cash from the customer upon delivery?`}
          confirmText="Yes, I got the cash"
          cancelText="Not yet"
          confirmStyle="primary"
          onConfirm={handleConfirmDelivery}
          onCancel={() => setDeliveryConfirmOrder(null)}
        />

        {/* Details & Visual Tracker in BottomSheet */}
        <BottomSheet
          isOpen={Boolean(sheetOrder)}
          onClose={() => setSheetOrder(null)}
          title={sheetOrder ? orderNumber(sheetOrder.id) : 'Order Details'}
        >
          {sheetOrder && (
            <div className="space-y-6">
              {/* Order Status & Date */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Ordered On
                  </span>
                  <span className="text-sm font-bold text-neutral-900">
                    {formatDateTime(sheetOrder.createdAt)}
                  </span>
                </div>
                <OrderStatusBadge status={sheetOrder.status} size="md" />
              </div>

              {/* Visual Tracker Timeline */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/90">
                <h4 className="font-extrabold text-sm text-neutral-900 mb-3">Order Progress Tracker</h4>
                <OrderTimeline status={sheetOrder.status} logs={sheetOrder.statusLogs || []} />
              </div>

              {/* Customer & Address Details */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-neutral-900">Buyer Details</h4>
                <div className="p-3.5 rounded-2xl border border-neutral-200 bg-white space-y-1.5 text-xs sm:text-sm">
                  <p className="font-bold text-neutral-900">{sheetOrder.otherPartyName || 'Customer'}</p>
                  {sheetOrder.otherPartyPhone && (
                    <a
                      href={`tel:${sheetOrder.otherPartyPhone}`}
                      className="text-emerald-700 font-bold block"
                    >
                      Call: {sheetOrder.otherPartyPhone}
                    </a>
                  )}
                  <p className="text-neutral-600">{sheetOrder.deliveryAddress}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-neutral-900">Items Ordered</h4>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                  {(sheetOrder.items || []).map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div>
                        <p className="font-bold text-neutral-900">{item.productName}</p>
                        <p className="text-neutral-500">
                          {item.quantity} {item.unit || 'unit'} × {formatINR(item.pricePerUnit)}
                        </p>
                      </div>
                      <span className="font-extrabold font-mono text-neutral-900">
                        {formatINR(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="text-sm font-extrabold text-emerald-950">Total Cash on Delivery:</span>
                <span className="text-xl font-black text-emerald-950 font-mono">
                  {formatINR(sheetOrder.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </BottomSheet>
      </div>
    </DashboardLayout>
  );
}
