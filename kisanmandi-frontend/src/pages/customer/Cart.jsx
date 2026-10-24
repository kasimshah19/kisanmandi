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
  Store
} from 'lucide-react';
import { cartService } from '../../services/cartService';
import { useCart } from '../../context/CartContext';
import QuantityInput from '../../components/QuantityInput';
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
  useDocumentTitle(`${t('cart.title')} | KisanMandi`);

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

  // Group items visually by farmer
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
      <div className="min-h-screen bg-[#fafaf7] py-8">
        <div className="page-container max-w-5xl space-y-4">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-12">
        <div className="page-container max-w-lg">
          <ErrorState title={t('cart.title')} message={error} onRetry={loadCart} />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-12">
        <div className="page-container max-w-lg">
          <EmptyState
            illustration={EmptyBox}
            title={t('cart.empty_cart')}
            message={t('cart.empty_cart_desc')}
            action={
              <Button as={Link} to="/products" variant="primary">
                {t('cart.start_shopping')}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10 pb-28 sm:pb-12">
      <div className="page-container max-w-5xl">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.cart') }
          ]}
          title={t('cart.title')}
          subtitle={t('cart.item_count', { count: cart.itemCount })}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
            >
              {t('cart.empty_cart_btn')}
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
          {/* Left Column: Farmer Group Cards */}
          <div className="lg:col-span-2 space-y-6">
            {itemsByFarmer.map((group, gIdx) => (
              <div
                key={group.farmerId || gIdx}
                className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden"
              >
                {/* Farmer Group Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-brand-50/70 to-neutral-50/50 border-b border-brand-100/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      <Store size={15} />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 text-sm">
                        {group.farmName || group.farmerName || 'Local Grower'}
                      </h3>
                      {(group.village || group.district) && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin size={11} className="text-brand-600" />
                          {group.village ? `${group.village}, ` : ''}{group.district || ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-800 bg-white px-2.5 py-1 rounded-full border border-brand-200">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items in this farm group */}
                <div className="divide-y divide-neutral-100">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 transition ${
                        !item.available ? 'bg-red-50/60' : 'hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        {/* Image */}
                        <Link
                          to={`/products/${item.productId}`}
                          className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/80 flex items-center justify-center group"
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
                                className="font-bold text-neutral-900 hover:text-brand-700 text-sm sm:text-base transition truncate"
                              >
                                {item.name}
                              </Link>
                              <button
                                onClick={() => handleRemove(item.id)}
                                aria-label={`Remove ${item.name} from cart`}
                                className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-neutral-100 transition shrink-0"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <p className="text-brand-800 text-xs sm:text-sm font-bold mt-0.5">
                              {formatINR(item.pricePerUnit)} / {unitLabel(item.unit, t)}
                            </p>

                            {!item.available && (
                              <div className="inline-flex items-center gap-1 text-xs text-red-700 font-semibold bg-red-100/80 px-2.5 py-0.5 rounded-lg border border-red-200 mt-1.5">
                                <AlertCircle size={12} />
                                {item.unavailableReason || t('products.out_of_stock')}
                              </div>
                            )}
                          </div>

                          {/* Quantity & Line Total */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100/70 gap-2">
                            <div className="w-32">
                              <QuantityInput
                                value={item.quantity}
                                unit={item.unit}
                                maxStock={item.availableStock}
                                onChange={(qty) => handleUpdate(item.id, qty)}
                                disabled={!item.available || updatingId === item.id}
                              />
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-neutral-400 block font-medium">
                                {t('cart.subtotal')}
                              </span>
                              <span className="font-black text-neutral-900 text-base tabular-nums">
                                {formatINR(item.lineTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary (Sticky Desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                {t('checkout.order_summary')}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.item_count', { count: cart.itemCount })}</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.delivery_fee')}</span>
                  <span className="text-brand-700 font-bold">{t('cart.free_delivery')}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline font-black text-lg text-neutral-900">
                  <span>{t('cart.total')}</span>
                  <span className="text-2xl text-brand-800 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Informational notes */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <Banknote size={15} className="text-brand-700 shrink-0 mt-0.5" />
                  <p className="leading-snug">{t('cart.cod_notice')}</p>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <Truck size={15} className="text-brand-700 shrink-0 mt-0.5" />
                  <p className="leading-snug">{t('cart.separate_orders_notice')}</p>
                </div>
              </div>

              {hasUnavailable && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-2xl border border-red-200 flex items-start gap-2">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <p className="font-medium leading-snug">{t('cart.unavailable_warning')}</p>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-bold shadow-md"
                disabled={hasUnavailable || cart.items.length === 0}
                onClick={() => navigate('/customer/checkout')}
              >
                <span>{t('cart.proceed_to_checkout')}</span>
                <ArrowRight size={18} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 p-3 shadow-2xl z-40 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              {t('cart.total')}
            </p>
            <p className="text-xl font-black text-brand-800 tabular-nums">
              {formatINR(cart.totalAmount)}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={hasUnavailable || cart.items.length === 0}
            onClick={() => navigate('/customer/checkout')}
            className="flex-1"
          >
            <span>{t('cart.proceed_to_checkout')}</span>
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
