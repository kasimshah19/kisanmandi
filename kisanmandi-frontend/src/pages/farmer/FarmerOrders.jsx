import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight, Filter } from 'lucide-react';
import { farmerOrderService } from '../../services/farmerOrderService';
import DashboardLayout from '../../components/DashboardLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, formatDate, orderNumber } from '../../utils/format';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    setLoading(true);
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
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0); // reset to first page
  };

  const statCards = [
    { label: 'New', count: counts?.placed || 0, status: 'PLACED', color: 'bg-blue-100 text-blue-800' },
    { label: 'To Pack', count: counts?.accepted || 0, status: 'ACCEPTED', color: 'bg-indigo-100 text-indigo-800' },
    { label: 'To Ship', count: counts?.packed || 0, status: 'PACKED', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        
        {/* Header & Stats */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Orders</h1>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {statCards.map(stat => (
              <button 
                key={stat.status}
                onClick={() => { setStatusFilter(stat.status); setPage(0); }}
                className={`p-4 rounded-xl border text-left transition-all ${statusFilter === stat.status ? 'ring-2 ring-green-500 border-transparent shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="text-sm font-medium text-gray-500">{stat.label} Orders</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 font-medium w-full sm:w-auto">
            <Filter size={18} /> Filter by Status:
          </div>
          <select 
            value={statusFilter} 
            onChange={handleStatusChange}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 text-sm"
          >
            <option value="">All Orders</option>
            <option value="PLACED">Placed (New)</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PACKED">Packed</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="space-y-4"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
        ) : orders.length === 0 ? (
          <EmptyState 
            icon={ClipboardList} 
            title="No orders found" 
            message={statusFilter ? `You have no orders in ${statusFilter.replace('_', ' ')} status.` : "You don't have any incoming orders yet."}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700 font-bold">
                  <tr>
                    <th className="px-6 py-4">Order ID & Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
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
                            <img src={order.firstItemImageUrl} className="w-8 h-8 rounded object-cover border" />
                          )}
                          <div className="max-w-[150px]">
                            <div className="truncate font-medium text-gray-900">{order.firstItemName}</div>
                            {order.itemCount > 1 && <div className="text-xs text-gray-500">+{order.itemCount - 1} more</div>}
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
                          View <ChevronRight size={16} />
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
