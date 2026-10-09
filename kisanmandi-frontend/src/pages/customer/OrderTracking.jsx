import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Receipt, Phone, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderTimeline from '../../components/OrderTimeline';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { SkeletonCard } from '../../components/Skeleton';
import { formatINR, formatDateTime, orderNumber, unitLabel } from '../../utils/format';
import { isActiveStatus } from '../../utils/orderStatus';
import toast from 'react-hot-toast';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const res = await orderService.get(id);
      setOrder(res.data);
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    setCancelling(true);
    try {
      await orderService.cancel(id, reason);
      toast.success('Order cancelled successfully');
      setCancelModalOpen(false);
      loadOrder(); // Refresh status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto"><SkeletonCard /></div>;
  if (!order) return <div className="text-center py-10">Order not found</div>;

  const canCancel = isActiveStatus(order.status) && order.status !== 'OUT_FOR_DELIVERY';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/customer/orders" className="flex items-center gap-1 text-gray-600 hover:text-green-700 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        {canCancel && (
          <button 
            onClick={() => setCancelModalOpen(true)}
            className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 transition"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gray-50 border-b p-6 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{orderNumber(order.id)}</h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm font-medium bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
              {order.paymentMode} - {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tracking Timeline */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-green-600" />
              Tracking History
            </h2>
            <OrderTimeline history={order.history} currentStatus={order.status} />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" /> Delivery Address
              </h3>
              <p className="text-sm font-medium text-gray-900">{order.shipName}</p>
              <p className="text-sm text-gray-600 mt-1">{order.shipLine1}</p>
              <p className="text-sm text-gray-600">{order.shipCity}, {order.shipState} - {order.shipPincode}</p>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <Phone size={14} /> {order.shipPhone}
              </p>
            </div>

            {/* Farmer Info */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2 text-sm uppercase tracking-wide">Sold By</h3>
              <p className="font-medium text-green-800">{order.farmerName}</p>
              <p className="text-sm text-green-700">{order.farmName}</p>
              <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                <Phone size={14} /> {order.farmerPhone}
              </p>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Receipt size={18} className="text-gray-500" /> Order Summary
              </h3>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 border-b last:border-0 bg-white items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover rounded" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} {unitLabel(item.unit)} × {formatINR(item.priceAtOrder)}
                      </p>
                    </div>
                    <div className="font-semibold text-sm text-gray-900 text-right shrink-0">
                      {formatINR(item.lineTotal)}
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 p-3 flex justify-between items-center font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-lg text-green-700">{formatINR(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText={cancelling ? "Cancelling..." : "Yes, Cancel Order"}
        confirmStyle="danger"
        showReasonInput={true}
        reasonLabel="Reason for cancellation"
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
