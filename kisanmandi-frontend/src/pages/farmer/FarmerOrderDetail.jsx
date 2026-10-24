import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Receipt, Phone, User, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { farmerOrderService } from '../../services/farmerOrderService';
import DashboardLayout from '../../components/DashboardLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatINR, formatDateTime, orderNumber, unitLabel } from '../../utils/format';
import { isActiveStatus } from '../../utils/orderStatus';
import toast from 'react-hot-toast';

export default function FarmerOrderDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update state
  const [updating, setUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');

  useDocumentTitle(order ? `${orderNumber(order.id)} | KisanMandi` : `Order Details | KisanMandi`);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await farmerOrderService.get(id);
      setOrder(res.data);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'REJECTED' && !updateNote.trim()) {
      toast.error(t('farmer.rejection_note_placeholder'));
      return;
    }

    setUpdating(true);
    try {
      await farmerOrderService.updateStatus(id, newStatus, updateNote);
      toast.success(t(`status.${newStatus}`));
      setUpdateNote('');
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="FARMER">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout role="FARMER">
        <ErrorState
          title={t('common.not_found_title')}
          message={error || t('common.not_found_desc')}
          onRetry={loadOrder}
        />
      </DashboardLayout>
    );
  }

  // Determine available next actions for this farmer
  const actions = [];
  const s = order.status;
  if (s === 'PLACED') {
    actions.push({ label: t('farmer.accept_order'), status: 'ACCEPTED', variant: 'primary' });
    actions.push({ label: t('farmer.reject_order'), status: 'REJECTED', variant: 'danger' });
  } else if (s === 'ACCEPTED') {
    actions.push({ label: t('farmer.mark_packed'), status: 'PACKED', variant: 'primary' });
  } else if (s === 'PACKED') {
    actions.push({ label: t('farmer.mark_shipped'), status: 'OUT_FOR_DELIVERY', variant: 'harvest' });
  } else if (s === 'OUT_FOR_DELIVERY') {
    actions.push({ label: t('farmer.mark_delivered'), status: 'DELIVERED', variant: 'primary' });
  }

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('farmer.manage_orders'), to: '/farmer/orders' },
            { label: orderNumber(order.id) },
          ]}
          title={orderNumber(order.id)}
          subtitle={t('orders.order_date', { date: formatDateTime(order.createdAt) })}
          actions={<OrderStatusBadge status={order.status} size="lg" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Main Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update Actions Box */}
            {actions.length > 0 && (
              <div className="bg-brand-50/70 border border-brand-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-200 text-brand-900 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </span>
                  <h3 className="font-extrabold text-base text-neutral-900">
                    {t('farmer.action_required')}
                  </h3>
                </div>

                {actions.some((a) => a.status === 'REJECTED') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Rejection Reason (required if rejecting)
                    </label>
                    <input
                      type="text"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      placeholder={t('farmer.rejection_note_placeholder')}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {actions.map((a) => (
                    <Button
                      key={a.status}
                      variant={a.variant}
                      size="md"
                      loading={updating}
                      onClick={() => handleUpdateStatus(a.status)}
                      className="min-h-[48px] flex-1 sm:flex-initial"
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {!isActiveStatus(order.status) && (
              <div className="bg-neutral-100 rounded-2xl p-4 text-xs sm:text-sm text-neutral-600 font-semibold border border-neutral-200">
                {t('farmer.cannot_modify_order')}
              </div>
            )}

            {/* Order Items List */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-base pb-3 border-b border-neutral-100 flex items-center gap-2">
                <Receipt size={18} className="text-brand-700" />
                {t('farmer.items_to_fulfill')}
              </h3>

              <div className="divide-y divide-neutral-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0">
                          <Receipt size={22} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-neutral-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                          {formatINR(item.priceAtOrder)} / {unitLabel(item.unit, t)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-neutral-500">
                        Qty: <strong className="text-neutral-900 font-mono">{item.quantity}</strong>
                      </p>
                      <p className="text-sm font-extrabold text-brand-900 font-mono mt-0.5">
                        {formatINR(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-600">
                  {t('orders.total_amount')} (Cash on Delivery)
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-brand-900 font-mono">
                  {formatINR(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-base pb-3 border-b border-neutral-100">
                Fulfillment Timeline
              </h3>
              <OrderTimeline status={order.status} history={order.history || []} />
            </div>
          </div>

          {/* Right Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2 pb-2 border-b border-neutral-100">
                <User size={16} className="text-brand-700" />
                {t('orders.customer_contact')}
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-extrabold text-neutral-900 text-base">
                  {order.customerName || 'Buyer'}
                </p>
                {order.customerPhone && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="inline-flex items-center gap-2 text-brand-800 font-bold bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl border border-brand-200 transition w-full"
                  >
                    <Phone size={14} className="text-brand-700" />
                    <span>Call Customer: {order.customerPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2 pb-2 border-b border-neutral-100">
                <MapPin size={16} className="text-amber-600" />
                {t('orders.delivery_to')}
              </h4>
              <div className="text-xs sm:text-sm text-neutral-600 space-y-1">
                <p className="font-bold text-neutral-900">{order.shipName}</p>
                <p>{order.shipLine1}</p>
                <p>
                  {order.shipCity}, {order.shipState}
                </p>
                <p className="font-mono font-semibold text-neutral-900">PIN: {order.shipPincode}</p>
                {order.shipPhone && (
                  <p className="pt-2 border-t border-neutral-100 text-neutral-500 font-medium">
                    Phone: {order.shipPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
