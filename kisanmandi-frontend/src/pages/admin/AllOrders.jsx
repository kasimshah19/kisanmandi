import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminOrderService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { formatINR, formatDate, orderNumber } from '../../utils/format';
import { ShoppingBag, Search, Filter } from 'lucide-react';

export default function AllOrders() {
  useDocumentTitle('All Orders | KisanMandi');
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = () => {
    setLoading(true);
    setError(null);
    adminOrderService.getAllOrders(page)
      .then(res => {
        setOrders(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(err => {
        const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load orders';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        String(o.id).includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="Platform Orders"
          subtitle="Real-time transaction flow, buyer commitments, and order fulfillment status"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
        />

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {['ALL', 'PLACED', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all capitalize ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <ErrorState title="Unable to Load Orders" message={error} onRetry={loadOrders} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Total Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Date Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-32"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-20"></div></td>
                        <td className="px-5 py-4"><div className="h-6 bg-neutral-200 rounded-full w-24"></div></td>
                        <td className="px-5 py-4 text-right"><div className="h-4 bg-neutral-200 rounded-md w-24 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-neutral-900 mb-1">No orders found</p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery || statusFilter !== 'ALL'
                            ? 'No orders match your filter criteria.'
                            : 'No customer orders have been recorded yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-neutral-900 text-sm">
                          {orderNumber(order.id)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                          {order.customerName || 'N/A'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-neutral-900 tabular-nums text-sm">
                          {formatINR(order.totalAmount)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right text-neutral-500 tabular-nums">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && !loading && (
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
