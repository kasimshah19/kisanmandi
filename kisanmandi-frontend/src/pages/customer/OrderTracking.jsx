import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Package,
  MapPin,
  Receipt,
  Phone,
  RotateCw,
  Star,
  Store,
  Banknote,
  CheckCircle2,
  XCircle,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderTimeline from '../../components/OrderTimeline';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import ReviewForm from '../../components/ReviewForm';
import StarRating from '../../components/StarRating';
import SpeakButton from '../../components/ui/SpeakButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatINR, formatDateTime, unitLabel } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import { isActiveStatus } from '../../utils/orderStatus';
import toast from 'react-hot-toast';

export default function OrderTracking() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const formattedOrderNo = order ? `KM-${String(order.id).padStart(5, '0')}` : '';

  useDocumentTitle(order ? `${formattedOrderNo} | KisanMandi` : `${t('orders.track_order')} | KisanMandi`);

  useEffect(() => {
    loadOrder(true);
  }, [id]);

  // 30s auto-refresh for order status
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) {
        orderService.get(id).then((res) => setOrder(res.data)).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const loadOrder = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await orderService.get(id);
      setOrder(res.data);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = async (reason) => {
    setCancelling(true);
    try {
      await orderService.cancel(id, reason);
      toast.success(t('orders.timeline_cancelled'));
      setCancelModalOpen(false);
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-8">
        <div className="page-container max-w-4xl space-y-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-12">
        <div className="page-container max-w-lg text-center space-y-4">
          <ErrorState
            title={t('common.not_found_title')}
            message={error || t('common.not_found_desc')}
            onRetry={() => loadOrder(true)}
          />
          <Button as={Link} to="/customer/orders" variant="outline" size="sm">
            &larr; {t('orders.back_to_orders')}
          </Button>
        </div>
      </div>
    );
  }

  const canCancel = isActiveStatus(order.status) && order.status !== 'OUT_FOR_DELIVERY';

  // Construct audio speech text for ListenButton
  const currentStatusLabel = t(`status.${order.status}`);
  const nextSentence =
    t(`status.${order.status.toLowerCase()}.next`, '') ||
    t(`status.${order.status}_next`, '');
  const speechText = `${formattedOrderNo}. ${t('orders.status_label')}: ${currentStatusLabel}. ${nextSentence}`;

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container max-w-5xl space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('orders.my_orders_title'), to: '/customer/orders' },
            { label: formattedOrderNo }
          ]}
          title={formattedOrderNo}
          subtitle={t('orders.order_date', { date: formatDateTime(order.createdAt) })}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                loading={refreshing}
                onClick={() => loadOrder(false)}
                className="text-xs font-bold"
              >
                <RotateCw size={13} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>

              {order.canReview && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setReviewModalOpen(true)}
                  className="text-xs font-bold"
                >
                  <Star size={13} className="mr-1.5 fill-current" />
                  {t('reviews.rate_this_farmer')}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(true)}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold"
                >
                  {t('orders.cancel_order')}
                </Button>
              )}
            </div>
          }
        />

        {/* Order Hero Status Card with Audio Readout */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 shadow-xs">
              <Truck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {t('orders.status_label')}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                {t(`status.${order.status}`)}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Listen Button reading status and next steps */}
            <SpeakButton
              text={speechText}
              label={t('speech.listen')}
              variant="secondary"
              size="md"
              className="rounded-2xl font-bold"
            />

            <div className="flex items-center gap-4 bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-200/80 text-xs">
              <div>
                <span className="text-neutral-500 font-medium block">{t('orders.payment_status')}</span>
                <span className="font-bold text-neutral-900">
                  {order.paymentMode === 'COD' || !order.paymentMode ? 'Pay cash on delivery' : order.paymentMode}
                </span>
              </div>
              <div className="w-px h-6 bg-neutral-200" />
              <div>
                <span className="text-neutral-500 font-medium block">{t('orders.total_amount')}</span>
                <span className="font-black text-green-800 text-sm tabular-nums">
                  {formatINR(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Detail Layout: Timeline (Left) + Summary & Contacts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tracking Timeline Column: BIG Vertical Progress Tracker */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-6">
            <h3 className="font-black text-neutral-900 text-lg flex items-center gap-2">
              <Package size={20} className="text-green-700" />
              {t('orders.tracking_history')}
            </h3>

            <OrderTimeline history={order.history} currentStatus={order.status} />
          </div>

          {/* Right Column: Address, Farmer, and Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Summary Card ("Pay cash when you receive. Rs X") */}
            <div className="bg-green-50/80 rounded-3xl border border-green-200/90 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-green-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Banknote size={24} />
                </div>
                <div>
                  <h4 className="font-black text-neutral-900 text-base">
                    {t('checkout.cash_on_delivery')}
                  </h4>
                  <p className="text-xs sm:text-sm text-green-900 mt-0.5">
                    Pay in cash when you receive and inspect your harvest.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  {t('common.total')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-green-900 tabular-nums">
                  {formatINR(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Existing User Review (if submitted) */}
            {order.myReview && (
              <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    {t('reviews.your_review')}
                  </h4>
                  <StarRating value={order.myReview.rating} size={15} />
                </div>
                {order.myReview.comment && (
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-wrap">
                    "{order.myReview.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Delivery Address & Farmer Contacts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Address Card */}
              <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-500">
                  <MapPin size={15} className="text-green-700" />
                  {t('orders.delivery_to')}
                </div>
                <div>
                  <p className="font-black text-neutral-900 text-base">{order.shipName}</p>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                    {order.shipLine1}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    {order.shipCity}, {order.shipState} -{' '}
                    <span className="font-bold text-neutral-900">{order.shipPincode}</span>
                  </p>
                  {order.shipPhone && (
                    <p className="text-xs font-semibold text-neutral-700 mt-2 flex items-center gap-1.5">
                      <Phone size={13} className="text-neutral-400" />
                      {order.shipPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Farmer Contact Card with Big Call Button */}
              <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-500">
                    <Store size={15} className="text-green-700" />
                    {t('orders.sold_by_label')}
                  </div>
                  <div className="mt-2">
                    <p className="font-black text-neutral-900 text-base">{order.farmerName}</p>
                    <p className="text-xs font-semibold text-green-800 mt-0.5">
                      {order.farmName || 'KisanMandi Grower'}
                    </p>
                  </div>
                </div>

                {/* Big "Call farmer" button ONLY if phone exists in order data */}
                {order.farmerPhone && (
                  <a
                    href={`tel:${order.farmerPhone}`}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Phone size={14} className="stroke-[2.5]" />
                    <span>{t('orders.call_farmer')}: {order.farmerPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Order Items as Cards */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-black text-neutral-900 text-lg flex items-center gap-2">
                <Receipt size={20} className="text-green-700" />
                {t('orders.order_summary')}
              </h3>

              <div className="space-y-3 divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 flex items-center gap-3.5"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200/80 shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={getOptimizedImageUrl(item.imageUrl, 140)}
                          alt={item.productName}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400 text-sm">
                          {(item.productName || 'P')[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-neutral-900 text-sm sm:text-base truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">
                        {item.quantity} {unitLabel(item.unit, t)} × {formatINR(item.priceAtOrder)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-neutral-900 text-sm sm:text-base tabular-nums">
                        {formatINR(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-neutral-500 uppercase tracking-wider block">
                    {t('orders.total_amount')}
                  </span>
                  <span className="text-xs text-green-700 font-bold">
                    {t('checkout.cash_on_delivery')}
                  </span>
                </div>
                <span className="text-2xl font-black text-green-800 tabular-nums">
                  {formatINR(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Farmer Modal */}
        {reviewModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            onClick={() => setReviewModalOpen(false)}
          >
            <div
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ReviewForm
                orderId={id}
                onSuccess={() => {
                  setReviewModalOpen(false);
                  loadOrder(false);
                }}
                onCancel={() => setReviewModalOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={cancelModalOpen}
          title={t('orders.cancel_confirm_title')}
          message={t('orders.cancel_confirm_msg')}
          confirmText={cancelling ? t('common.loading') : t('orders.confirm_cancel_btn')}
          confirmStyle="danger"
          showReasonInput={true}
          reasonLabel={t('orders.cancel_reason_label')}
          onConfirm={handleCancel}
          onCancel={() => setCancelModalOpen(false)}
        />
      </div>
    </div>
  );
}
