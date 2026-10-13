import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ArrowRight, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { addressService } from '../../services/addressService';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import AddressForm from '../../components/AddressForm';
import { SkeletonCard } from '../../components/Skeleton';
import { formatINR } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('checkout.title')} | KisanMandi`);

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
        toast.error(t('cart.unavailable_warning'));
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
      toast.error(t('errors.generic_retry'));
      navigate('/customer/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (data) => {
    try {
      const res = await addressService.create(data);
      toast.success(t('addresses.saved_success'));
      setAddresses(prev => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic_retry'));
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error(t('checkout.select_address_error'));
      return;
    }
    setPlacingOrder(true);
    try {
      await orderService.checkout(selectedAddressId, 'COD');
      toast.success(t('checkout.order_success_title'));
      refreshCart();
      navigate('/customer/orders'); 
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic_retry'));
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto"><SkeletonCard /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              {t('checkout.delivery_address')}
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
                        {addr.defaultAddress && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">{t('checkout.default_badge')}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="text-green-600 font-medium text-sm hover:underline mt-2 inline-block min-h-[44px]"
                >
                  + {t('checkout.add_new_address')}
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.payment_method')}</h2>
            <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <p className="font-bold text-gray-900">{t('checkout.cash_on_delivery')}</p>
                  <p className="text-sm text-gray-600">{t('checkout.pay_on_delivery')}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 items-start text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p>{t('checkout.split_warning')}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.order_summary')}</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(item.imageUrl, 120)}
                      alt={item.name || 'Produce item'}
                      loading="lazy"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-gray-500">{t('products.quantity')}: {item.quantity}</p>
                    <p className="font-semibold text-gray-900">{formatINR(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>{t('cart.item_count', { count: cart.itemCount })}</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>{t('checkout.delivery_charges')}</span>
                <span className="text-green-600 font-medium">{t('checkout.free_delivery')}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t">
                <span>{t('checkout.grand_total')}</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placingOrder || !selectedAddressId || showAddForm}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('checkout.placing_order')}</span>
                </>
              ) : (
                <>
                  <span>{t('checkout.place_order_btn')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
