import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Star, Calendar, Store } from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderStatusBadge from '../../components/OrderStatusBadge';
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
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function MyOrders() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('orders.my_orders_title')} | KisanMandi`);

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.list({
        status: statusFilter || undefined,
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

  const statusTabs = [
    { key: '', label: t('orders.all_orders') },
    { key: 'PLACED', label: t('status.PLACED') },
    { key: 'ACCEPTED', label: t('status.ACCEPTED') },
    { key: 'OUT_FOR_DELIVERY', label: t('status.OUT_FOR_DELIVERY') },
    { key: 'DELIVERED', label: t('status.DELIVERED') },
    { key: 'CANCELLED', label: t('status.CANCELLED') }
  ];

  const getStatusBorderClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'border-l-4 border-l-brand-600';
      case 'OUT_FOR_DELIVERY':
        return 'border-l-4 border-l-amber-500';
      case 'ACCEPTED':
      case 'PACKED':
        return 'border-l-4 border-l-blue-500';
      case 'PLACED':
        return 'border-l-4 border-l-brand-400';
      case 'CANCELLED':
      case 'REJECTED':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-neutral-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container max-w-5xl">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('orders.my_orders_title') }
          ]}
          title={t('orders.my_orders_title')}
          subtitle={t('orders.my_orders_subtitle')}
        />

        {/* Filter Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 my-6 scrollbar-hide">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition min-h-[38px] ${
                  isActive
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                {tab.label}
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
        ) : orders.length === 0 ? (
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
            {orders.map((order) => {
              const kmId = `KM-${String(order.id).padStart(5, '0')}`;
              return (
                <Link
                  key={order.id}
                  to={`/customer/orders/${order.id}`}
                  className={`block bg-white rounded-3xl border border-neutral-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden group ${getStatusBorderClass(
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
                        <span className="font-extrabold text-neutral-900 font-mono">
                          {kmId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          {t('orders.timeline_placed')}
                        </span>
                        <span className="font-semibold text-neutral-800 flex items-center gap-1">
                          <Calendar size={12} className="text-neutral-400" />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          {t('common.total')}
                        </span>
                        <span className="font-extrabold text-brand-800 tabular-nums">
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
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Order Card Body */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* First item thumbnail */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-neutral-100 border border-neutral-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {order.firstItemImageUrl ? (
                          <img
                            src={getOptimizedImageUrl(order.firstItemImageUrl, 160)}
                            alt={order.firstItemName || 'Produce item'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="text-xs text-neutral-400 font-bold">
                            {(order.firstItemName || 'P')[0]}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-neutral-900 text-base sm:text-lg truncate group-hover:text-brand-700 transition">
                          {order.firstItemName}
                        </h3>
                        {order.itemCount > 1 && (
                          <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                            {t('orders.more_items', { count: order.itemCount - 1 })}
                          </p>
                        )}
                        <p className="text-xs font-medium text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full mt-2 inline-flex items-center gap-1">
                          <Store size={12} className="text-brand-600" />
                          {t('orders.sold_by', { name: order.otherPartyName })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-center text-xs font-bold text-brand-700 group-hover:text-brand-900 transition shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <span>{t('orders.view_details')}</span>
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
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
