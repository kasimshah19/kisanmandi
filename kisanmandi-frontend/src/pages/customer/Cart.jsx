import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  ArrowRight,
  MapPin,
  AlertCircle,
  Truck,
  Banknote,
  ShieldAlert,
  Store,
  ShoppingBag
} from 'lucide-react';
import { cartService } from '../../services/cartService';
import { useCart } from '../../context/CartContext';
import NumberStepper from '../../components/ui/NumberStepper';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import EmptyBox from '../../components/illustrations/EmptyBox';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/Skeleton';
import { formatINR, unitLabel } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function Cart() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('cart.title', 'My Cart')} | KisanMandi`);

  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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

  useEffect(() => {
    loadCart();
  }, []);

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
      toast.success(t('cart.item_removed', 'Item removed from cart'));
      await loadCart();
      refreshCart();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  const handleClear = async () => {
    if (!window.confirm(t('cart.empty_cart_confirm', 'Are you sure you want to remove all items from your cart?'))) return;
    try {
      await cartService.clear();
      toast.success(t('cart.cart_cleared', 'Cart cleared'));
      await loadCart();
      refreshCart();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  // Group items visually by farmer: "From {farm name}, {village}"
  const itemsByFarmer = useMemo(() => {
    if (!cart?.items) return [];
    const groups = {};
    cart.items.forEach((item) => {
      const key = item.farmerId || item.farmerName || 'kisan';
      if (!groups[key]) {
        groups[key] = {
          farmerId: item.farmerId,
          farmerName: item.farmerName,
          farmName: item.farmName,
          village: item.village,
          district: item.district,
          items: []
        };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups);
  }, [cart?.items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 py-8">
        <div className="page-container max-w-5xl space-y-4">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-50 py-12">
        <div className="page-container max-w-lg">
          <ErrorState title={t('cart.title', 'My cart')} message={error} onRetry={loadCart} />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-warm-50 py-12">
        <div className="page-container max-w-lg">
          <EmptyState
            illustration={EmptyBox}
            title={t('cart.empty_cart', 'Your cart is empty')}
            message={t('cart.empty_cart_desc', 'Explore direct farm harvests and support local growers.')}
            action={
              <Button as={Link} to="/products" variant="primary" size="lg" className="min-h-[50px] font-bold">
                <ShoppingBag size={18} className="mr-2" />
                {t('cart.start_shopping', 'Browse produce')}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <div className="min-h-screen bg-warm-50 py-6 sm:py-8 lg:py-10 pb-36 sm:pb-12">
      <div className="page-container max-w-5xl">
        {/* Page Header with Rename to 'My cart' and Big Item Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {t('cart.title', 'My cart')}
              </h1>
              <span className="px-3.5 py-1 rounded-full bg-green-100 text-green-900 font-extrabold text-sm border border-green-200">
                {t('cart.item_count', { count: cart.itemCount })}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-1 font-medium">
              {t('cart.cart_subtitle', 'Review your fresh items before placing your doorstep cash order.')}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold self-start sm:self-auto min-h-[40px] cursor-pointer"
          >
            <Trash2 size={14} className="mr-1.5" />
            {t('cart.empty_cart_btn', 'Empty entire cart')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Grouped by Farmer */}
          <div className="lg:col-span-2 space-y-6">
            {itemsByFarmer.map((group, gIdx) => (
              <div
                key={group.farmerId || gIdx}
                className="bg-white rounded-3xl border-2 border-stone-200/90 shadow-2xs overflow-hidden"
              >
                {/* Farmer Group Header: "From {farm name}, {village}" */}
                <div className="px-5 py-4 bg-gradient-to-r from-green-50/80 to-stone-50 border-b-2 border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      <Store size={17} />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-stone-900 text-base">
                        From {group.farmName || group.farmerName || 'Local Grower'}
                        {group.village ? `, ${group.village}` : ''}
                      </h2>
                      {group.district && (
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin size={12} className="text-green-700" />
                          <span>{group.district}, Maharashtra</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-900 bg-white px-3 py-1 rounded-full border border-green-200 shadow-2xs">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items in this farm group */}
                <div className="divide-y divide-stone-100">
                  {group.items.map((item) => {
                    const unitStr = unitLabel(item.unit, t);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 transition ${
                          !item.available ? 'bg-rose-50/80 border-l-4 border-l-rose-500' : 'hover:bg-stone-50/50'
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          {/* Photo */}
                          <Link
                            to={`/products/${item.productId}`}
                            className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 rounded-2xl overflow-hidden border-2 border-stone-200 flex items-center justify-center group"
                          >
                            <img
                              src={getOptimizedImageUrl(item.imageUrl, 200)}
                              alt={item.name || 'Produce item'}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  to={`/products/${item.productId}`}
                                  className="font-extrabold text-stone-900 hover:text-green-700 text-base sm:text-lg transition truncate leading-snug"
                                >
                                  {item.name}
                                </Link>

                                {/* Labeled Remove Button with Icon + Word */}
                                <button
                                  type="button"
                                  onClick={() => handleRemove(item.id)}
                                  aria-label={`Remove ${item.name} from cart`}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 hover:text-rose-900 hover:bg-rose-100/80 rounded-xl transition shrink-0 cursor-pointer border border-rose-200"
                                >
                                  <Trash2 size={13} />
                                  <span>{t('cart.remove_item', 'Remove')}</span>
                                </button>
                              </div>

                              <p className="text-green-800 text-sm font-extrabold mt-1">
                                {formatINR(item.pricePerUnit)}{' '}
                                <span className="text-xs font-semibold text-stone-500">/ {unitStr}</span>
                              </p>

                              {/* Red-tinted reason if unavailable */}
                              {!item.available && (
                                <div className="inline-flex items-center gap-1.5 text-xs text-rose-800 font-bold bg-white px-3 py-1 rounded-xl border border-rose-300 mt-2 shadow-2xs">
                                  <AlertCircle size={14} className="text-rose-600" />
                                  <span>{item.unavailableReason || t('products.out_of_stock', 'Not available')}</span>
                                </div>
                              )}
                            </div>

                            {/* Quantity & Line Total */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 gap-2">
                              <div className="w-36">
                                <NumberStepper
                                  value={item.quantity}
                                  unit={unitStr}
                                  max={item.availableStock || 9999}
                                  step={item.unit === 'DOZEN' || item.unit === 'PIECE' ? 1 : 1}
                                  onChange={(qty) => handleUpdate(item.id, qty)}
                                  disabled={!item.available || updatingId === item.id}
                                />
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-stone-400 block font-bold uppercase tracking-wider">
                                  {t('cart.subtotal', 'Total')}
                                </span>
                                <span className="font-black text-stone-900 text-lg tabular-nums">
                                  {formatINR(item.lineTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary (Sticky Desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200/90 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                {t('checkout.order_summary', 'Order summary')}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>{t('cart.item_count', { count: cart.itemCount })}</span>
                  <span className="font-bold text-stone-900 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>{t('cart.delivery_fee', 'Doorstep Delivery')}</span>
                  <span className="text-green-700 font-bold">{t('cart.free_delivery', 'Free')}</span>
                </div>
                <div className="border-t-2 border-stone-100 pt-3 flex justify-between items-baseline font-black text-lg text-stone-900">
                  <span>{t('cart.total', 'Total')}</span>
                  <span className="text-3xl text-green-900 tabular-nums font-black">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Short plain note as required: "Items from different farmers come as separate orders. You pay cash when you receive." */}
              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-700 font-medium">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <Banknote size={18} className="text-amber-800 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    {t(
                      'cart.plain_cod_explanation',
                      'Items from different farmers come as separate orders. You pay cash when you receive.'
                    )}
                  </p>
                </div>
              </div>

              {hasUnavailable && (
                <div className="bg-rose-50 text-rose-800 text-xs p-3.5 rounded-2xl border border-rose-200 flex items-start gap-2">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <p className="font-bold leading-snug">{t('cart.unavailable_warning', 'Please remove unavailable items before placing order.')}</p>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-extrabold min-h-[56px] shadow-card cursor-pointer"
                disabled={hasUnavailable || cart.items.length === 0}
                onClick={() => navigate('/customer/checkout')}
              >
                <span>{t('cart.place_order_btn', 'Place order')}</span>
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar: "Total Rs X" and big "Place order" button */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t-2 border-stone-200 p-3.5 shadow-pop z-40 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t('cart.total', 'Total')}
            </p>
            <p className="text-2xl font-black text-green-900 tabular-nums leading-tight">
              {formatINR(cart.totalAmount)}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            disabled={hasUnavailable || cart.items.length === 0}
            onClick={() => navigate('/customer/checkout')}
            className="flex-1 min-h-[52px] font-extrabold text-sm sm:text-base shadow-xs"
          >
            <span>{t('cart.place_order_btn', 'Place order')}</span>
            <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
