import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartService } from '../../services/cartService';
import { useCart } from '../../context/CartContext';
import QuantityInput from '../../components/QuantityInput';
import EmptyState from '../../components/EmptyState';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, unitLabel } from '../../utils/format';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartService.get();
      setCart(res.data);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (itemId, quantity) => {
    setUpdatingId(itemId);
    try {
      await cartService.update(itemId, quantity);
      await loadCart();
      refreshCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartService.remove(itemId);
      toast.success('Item removed');
      await loadCart();
      refreshCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to empty your cart?')) return;
    try {
      await cartService.clear();
      toast.success('Cart cleared');
      await loadCart();
      refreshCart();
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added any products yet."
          action={
            <Link to="/products" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  // Check if any item is unavailable (stock <= 0 or product deleted/inactive)
  const hasUnavailable = cart.items.some(i => !i.available);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
        <button onClick={handleClear} className="text-red-600 text-sm hover:underline font-medium">
          Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border ${!item.available ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex gap-4">
                {/* Image */}
                <Link to={`/products/${item.productId}`} className="shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-green-700">
                        {item.name}
                      </Link>
                      <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-green-700 text-sm font-medium mt-1">
                      {formatINR(item.pricePerUnit)} / {unitLabel(item.unit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Farmer: {item.farmerName}</p>
                    
                    {!item.available && (
                      <p className="text-xs text-red-600 mt-1 font-medium bg-red-100 w-fit px-2 py-0.5 rounded">
                        {item.unavailableReason}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Total */}
                  <div className="flex items-center justify-between mt-3">
                    <QuantityInput
                      value={item.quantity}
                      unit={item.unit}
                      maxStock={item.availableStock}
                      onChange={(qty) => handleUpdate(item.id, qty)}
                      disabled={!item.available || updatingId === item.id}
                    />
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Subtotal</p>
                      <p className="font-bold text-gray-900">{formatINR(item.lineTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cart.itemCount})</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
            </div>

            {hasUnavailable ? (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-4">
                Please remove unavailable items before checking out.
              </div>
            ) : null}

            <button
              onClick={() => navigate('/customer/checkout')}
              disabled={hasUnavailable || cart.items.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
