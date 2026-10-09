import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Receipt, Phone, User, Info } from 'lucide-react';
import { farmerOrderService } from '../../services/farmerOrderService';
import DashboardLayout from '../../components/DashboardLayout';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { SkeletonCard } from '../../components/Skeleton';
import { formatINR, formatDateTime, orderNumber, unitLabel } from '../../utils/format';
import { isActiveStatus } from '../../utils/orderStatus';
import toast from 'react-hot-toast';

export default function FarmerOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Status update state
  const [updating, setUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const res = await farmerOrderService.get(id);
      setOrder(res.data);
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'REJECTED' && !updateNote.trim()) {
      toast.error('Please provide a reason for rejecting the order');
      return;
    }

    setUpdating(true);
    try {
      await farmerOrderService.updateStatus(id, newStatus, updateNote);
      toast.success(`Order status updated to ${newStatus}`);
      setUpdateNote('');
      loadOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout role="FARMER"><SkeletonCard /></DashboardLayout>;
  if (!order) return <DashboardLayout role="FARMER"><div className="text-center py-10">Order not found</div></DashboardLayout>;

  // Determine available next actions
  const actions = [];
  const s = order.status;
  if (s === 'PLACED') {
    actions.push({ label: 'Accept Order', status: 'ACCEPTED', color: 'bg-indigo-600 hover:bg-indigo-700' });
    actions.push({ label: 'Reject', status: 'REJECTED', color: 'bg-red-600 hover:bg-red-700 outline' });
  } else if (s === 'ACCEPTED') {
    actions.push({ label: 'Mark as Packed', status: 'PACKED', color: 'bg-purple-600 hover:bg-purple-700' });
  } else if (s === 'PACKED') {
    actions.push({ label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY', color: 'bg-orange-600 hover:bg-orange-700' });
  } else if (s === 'OUT_FOR_DELIVERY') {
    actions.push({ label: 'Mark as Delivered', status: 'DELIVERED', color: 'bg-green-600 hover:bg-green-700' });
  }

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/farmer/orders" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{orderNumber(order.id)}</h2>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">Placed on {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-700">{formatINR(order.totalAmount)}</p>
                </div>
              </div>

              {/* Status Update Actions */}
              {actions.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                    <Info size={18} /> Action Required
                  </h3>
                  
                  {actions.some(a => a.status === 'REJECTED') && (
                    <div className="mb-3">
                      <input 
                        type="text" 
                        value={updateNote}
                        onChange={e => setUpdateNote(e.target.value)}
                        placeholder="Add a note (Required if rejecting)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {actions.map(a => (
                      <button
                        key={a.status}
                        disabled={updating}
                        onClick={() => handleUpdateStatus(a.status)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 ${
                          a.color.includes('outline') 
                            ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' 
                            : `text-white ${a.color}`
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {!isActiveStatus(order.status) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 font-medium">
                  This order is {order.status.toLowerCase()} and cannot be modified.
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt size={20} className="text-green-600" /> Items to Fulfill
              </h3>
              
              <div className="divide-y border rounded-lg">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded border shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover rounded" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Price: {formatINR(item.priceAtOrder)} / {unitLabel(item.unit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Qty: <span className="font-bold text-gray-900">{item.quantity}</span></p>
                      <p className="font-bold text-green-700">{formatINR(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Customer Details
              </h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone size={14} /> {order.customerPhone}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-orange-600" /> Delivery Address
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">{order.shipName}</p>
                <p>{order.shipLine1}</p>
                <p>{order.shipCity}, {order.shipState}</p>
                <p className="font-medium text-gray-900 mt-1">PIN: {order.shipPincode}</p>
                <p className="flex items-center gap-2 mt-2 pt-2 border-t text-gray-500">
                  <Phone size={14} /> {order.shipPhone}
                </p>
              </div>
            </div>
            
            {/* History Log */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Status History</h3>
              <div className="space-y-4 border-l-2 border-gray-100 ml-2 pl-4">
                {(order.history || []).map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    <p className="text-sm font-medium text-gray-900">{h.status}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(h.changedAt)}</p>
                    {h.note && <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-1.5 rounded">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
