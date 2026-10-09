import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, MapPin, AlertTriangle } from 'lucide-react';
import { addressService } from '../../services/addressService';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import AddressForm from '../../components/AddressForm';
import { SkeletonCard } from '../../components/Skeleton';
import { formatINR } from '../../utils/format';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([
        cartService.get(),
        addressService.getAll()
      ]);
      
      const cartData = cartRes.data;
      if (!cartData || cartData.items.length === 0) {
        navigate('/customer/cart');
        return;
      }
      if (cartData.items.some(i => !i.available)) {
        toast.error('Some items are unavailable. Please review your cart.');
        navigate('/customer/cart');
        return;
      }
      
      setCart(cartData);
      setAddresses(addrRes.data);
      
      // Auto-select default or first address
      if (addrRes.data.length > 0) {
        const def = addrRes.data.find(a => a.defaultAddress);
        setSelectedAddressId(def ? def.id : addrRes.data[0].id);
      } else {
        setShowAddForm(true);
      }
    } catch (error) {
      toast.error('Failed to load checkout data');
      navigate('/customer/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (data) => {
    try {
      const res = await addressService.create(data);
      toast.success('Address added');
      setAddresses(prev => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await orderService.checkout(selectedAddressId, 'COD');
      toast.success('Order placed successfully!');
      refreshCart();
      // res.data is a List<OrderResponse> (one per farmer)
      navigate('/customer/orders'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto"><SkeletonCard /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Delivery Address
            </h2>

            {showAddForm ? (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <AddressForm 
                  onSubmit={handleAddAddress} 
                  onCancel={addresses.length > 0 ? () => setShowAddForm(false) : null}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="address" 
                      value={addr.id} 
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{addr.fullName}</span>
                        <span className="text-sm text-gray-500">{addr.phone}</span>
                        {addr.defaultAddress && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="text-green-600 font-medium text-sm hover:underline mt-2 inline-block"
                >
                  + Add new address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-600">Pay when your order arrives</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 items-start text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p>Your order will be split by farmer. You will receive separate deliveries from each farmer.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                     {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover rounded" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-semibold text-gray-900">{formatINR(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t">
                <span>Total Amount</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placingOrder || !selectedAddressId || showAddForm}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
              {!placingOrder && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
