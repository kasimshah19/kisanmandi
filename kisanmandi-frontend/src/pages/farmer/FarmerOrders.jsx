import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, ChevronRight, Filter } from 'lucide-react';
import { farmerOrderService } from '../../services/farmerOrderService';
import DashboardLayout from '../../components/DashboardLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, formatDate, orderNumber } from '../../utils/format';
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
          sort: 'createdAt,desc'
        }),
        farmerOrderService.summary()
      ]);
      setOrders(ordersRes.data.content);
      setTotalPages(ordersRes.data.totalPages);
      setCounts(summaryRes.data);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0); // reset to first page
  };

  const statCards = [
    { label: t('farmer.new_orders'), count: counts?.placed || 0, status: 'PLACED' },
    { label: t('farmer.to_pack'), count: counts?.accepted || 0, status: 'ACCEPTED' },
    { label: t('farmer.to_ship'), count: counts?.packed || 0, status: 'PACKED' },
  ];

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        
        {/* Header & Stats */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('farmer.manage_orders')}</h1>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {statCards.map(stat => (
              <button 
                key={stat.status}
                onClick={() => { setStatusFilter(stat.status); setPage(0); }}
                className={`p-4 rounded-xl border text-left transition-all ${statusFilter === stat.status ? 'ring-2 ring-green-500 border-transparent shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 font-medium w-full sm:w-auto">
            <Filter size={18} /> {t('farmer.filter_by_status')}
          </div>
          <select 
            value={statusFilter} 
            onChange={handleStatusChange}
            aria-label={t('farmer.filter_by_status')}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 text-sm"
          >
            <option value="">{t('orders.all_orders')}</option>
            <option value="PLACED">{t('status.PLACED')}</option>
            <option value="ACCEPTED">{t('status.ACCEPTED')}</option>
            <option value="PACKED">{t('status.PACKED')}</option>
            <option value="OUT_FOR_DELIVERY">{t('status.OUT_FOR_DELIVERY')}</option>
            <option value="DELIVERED">{t('status.DELIVERED')}</option>
            <option value="CANCELLED">{t('status.CANCELLED')}</option>
            <option value="REJECTED">{t('status.REJECTED')}</option>
          </select>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="space-y-4"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
        ) : error ? (
          <ErrorState
            title={t('errors.generic_retry')}
            message={error}
            onRetry={loadData}
          />
        ) : orders.length === 0 ? (
          <EmptyState 
            icon={ClipboardList} 
            title={t('orders.no_orders')} 
            message={t('orders.no_orders_desc')}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700 font-bold">
                  <tr>
                    <th className="px-6 py-4">{t('farmer.order_id_and_date')}</th>
                    <th className="px-6 py-4">{t('farmer.customer_name')}</th>
                    <th className="px-6 py-4">{t('farmer.items')}</th>
                    <th className="px-6 py-4">{t('farmer.amount')}</th>
                    <th className="px-6 py-4">{t('orders.status_label')}</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{orderNumber(order.id)}</div>
                        <div className="text-xs mt-1">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.otherPartyName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.firstItemImageUrl && (
                            <img src={order.firstItemImageUrl} alt={order.firstItemName} className="w-8 h-8 rounded object-cover border" />
                          )}
                          <div className="max-w-[150px]">
                            <div className="truncate font-medium text-gray-900">{order.firstItemName}</div>
                            {order.itemCount > 1 && <div className="text-xs text-gray-500">+{order.itemCount - 1}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-green-700">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/farmer/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-green-600 font-medium hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg transition"
                        >
                          {t('orders.view_details')} <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
