import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, formatDate, orderNumber } from '../../utils/format';
import { isTerminalStatus } from '../../utils/orderStatus';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Basic filtering
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Build query string
      const res = await orderService.list({
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc'
      });
      setOrders(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        
        <select 
          value={statusFilter} 
          onChange={handleStatusChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-sm"
        >
          <option value="">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState 
          icon={Package} 
          title="No orders found" 
          message={statusFilter ? "You have no orders with this status." : "You haven't placed any orders yet."}
          action={
            <Link to="/products" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mt-2">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link 
              key={order.id} 
              to={`/customer/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:border-green-400 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-50 px-6 py-3 border-b flex flex-wrap justify-between items-center gap-4 text-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wider">Order Placed</span>
                    <span className="font-semibold text-gray-900">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wider">Total</span>
                    <span className="font-semibold text-gray-900">{formatINR(order.totalAmount)}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-gray-500 block text-xs uppercase tracking-wider">Order #</span>
                    <span className="font-semibold text-gray-900">{orderNumber(order.id)}</span>
                  </div>
                  {order.canReview && <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Rate now</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs hidden sm:inline">Status:</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border">
                    {order.firstItemImageUrl ? (
                       <img src={order.firstItemImageUrl} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{order.firstItemName}</h3>
                    {order.itemCount > 1 && (
                      <p className="text-sm text-gray-500">
                        + {order.itemCount - 1} more item{order.itemCount > 2 ? 's' : ''}
                      </p>
                    )}
                    <p className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded mt-1 inline-block">
                      Sold by: {order.otherPartyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-green-600 font-medium whitespace-nowrap">
                  View Details <ChevronRight size={18} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
