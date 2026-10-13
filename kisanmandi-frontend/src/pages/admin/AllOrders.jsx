import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminOrderService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { formatINR, formatDate, orderNumber } from '../../utils/format';
import { ShoppingBag } from 'lucide-react';

export default function AllOrders() {
  useDocumentTitle('All Orders | KisanMandi');
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Failed to load orders. Please check your network connection.');
        toast.error('Failed to load orders');
      })
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide customer transactions and fulfillment tracking</p>
        </div>

        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ErrorState title="Unable to Load Orders" message={error} onRetry={loadOrders} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No orders recorded yet</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {orderNumber(order.id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customerName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatINR(order.totalAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && !loading && (
              <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
