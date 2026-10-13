import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartService } from '../../services/cartService';
import { useCart } from '../../context/CartContext';
import QuantityInput from '../../components/QuantityInput';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, unitLabel } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function Cart() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('cart.title')} | KisanMandi`);

  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartService.get();
      setCart(res.data);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
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
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartService.remove(itemId);
      toast.success(t('cart.item_removed'));
      await loadCart();
      refreshCart();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  const handleClear = async () => {
    if (!window.confirm(t('cart.empty_cart_confirm'))) return;
    try {
      await cartService.clear();
      toast.success(t('cart.cart_cleared'));
      await loadCart();
      refreshCart();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">{t('cart.title')}</h1>
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title={t('cart.title')}
          message={error}
          onRetry={loadCart}
        />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.empty_cart')}
          message={t('cart.empty_cart_desc')}
          action={
            <Link
              to="/products"
              className="bg-green-700 text-white px-6 py-2.5 rounded-lg hover:bg-green-800 transition min-h-[44px] inline-flex items-center justify-center font-medium"
            >
              {t('cart.start_shopping')}
            </Link>
          }
        />
      </div>
    );
  }

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('cart.title')}</h1>
        <button
          onClick={handleClear}
          className="text-red-600 text-sm hover:underline font-medium p-2 min-h-[44px] inline-flex items-center"
        >
          {t('cart.empty_cart_btn')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-xl shadow-sm border ${
                !item.available ? 'border-red-200 bg-red-50/60' : 'border-gray-200'
              }`}
            >
              <div className="flex gap-4">
                {/* Image */}
                <Link
                  to={`/products/${item.productId}`}
                  className="shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={getOptimizedImageUrl(item.imageUrl, 200)}
                    alt={item.name || 'Produce item'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-gray-900 hover:text-green-700 transition"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-gray-400 hover:text-red-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-green-700 text-sm font-bold mt-0.5">
                      {formatINR(item.pricePerUnit)} / {unitLabel(item.unit, t)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{t('cart.farmer', { name: item.farmerName })}</p>

                    {!item.available && (
                      <p className="text-xs text-red-600 mt-1 font-medium bg-red-100 w-fit px-2 py-0.5 rounded">
                        {item.unavailableReason}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Total */}
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <QuantityInput
                      value={item.quantity}
                      unit={item.unit}
                      maxStock={item.availableStock}
                      onChange={(qty) => handleUpdate(item.id, qty)}
                      disabled={!item.available || updatingId === item.id}
                    />
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{t('cart.subtotal')}</p>
                      <p className="font-bold text-gray-900 text-base">{formatINR(item.lineTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.order_summary')}</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.item_count', { count: cart.itemCount })}</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.delivery_fee')}</span>
                <span className="text-green-700 font-semibold">{t('cart.free_delivery')}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>{t('cart.total')}</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
            </div>

            {hasUnavailable ? (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4">
                {t('cart.unavailable_warning')}
              </div>
            ) : null}

            <button
              onClick={() => navigate('/customer/checkout')}
              disabled={hasUnavailable || cart.items.length === 0}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <span>{t('cart.proceed_to_checkout')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-2xl z-40">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <p className="text-xs text-gray-500">{t('cart.item_count', { count: cart.itemCount })}</p>
            <p className="text-lg font-extrabold text-gray-900">{formatINR(cart.totalAmount)}</p>
          </div>
          <button
            onClick={() => navigate('/customer/checkout')}
            disabled={hasUnavailable || cart.items.length === 0}
            className="flex-1 bg-green-700 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            <span>{t('checkout.title')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
