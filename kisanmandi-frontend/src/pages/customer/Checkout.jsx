import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ArrowRight,
  MapPin,
  AlertTriangle,
  Banknote,
  Plus,
  ShieldCheck,
  PackageCheck,
  Phone
} from 'lucide-react';
import { addressService } from '../../services/addressService';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import AddressForm from '../../components/AddressForm';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
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
      if (cartData.items.some((i) => !i.available)) {
        toast.error(t('cart.unavailable_warning'));
        navigate('/customer/cart');
        return;
      }

      setCart(cartData);
      setAddresses(addrRes.data || []);

      // Auto-select default or first address
      if (addrRes.data && addrRes.data.length > 0) {
        const def = addrRes.data.find((a) => a.defaultAddress);
        setSelectedAddressId(def ? def.id : addrRes.data[0].id);
      } else {
        setShowAddForm(true);
      }
    } catch {
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
      setAddresses((prev) => [...prev, res.data]);
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
      const res = await orderService.checkout(selectedAddressId, 'COD');
      toast.success(t('checkout.order_success_title'));
      refreshCart();
      const placed = Array.isArray(res.data) ? res.data[0] : res.data;
      navigate('/customer/orders', { state: { justPlacedOrder: placed || { id: Date.now() } } });
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || 'Price or stock changed. Please review your cart.');
        navigate('/customer/cart');
      } else {
        toast.error(error.response?.data?.message || t('errors.generic_retry'));
      }
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-8">
        <div className="page-container max-w-4xl space-y-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: t('checkout.step_address'), active: true, completed: !!selectedAddressId },
    { num: 2, label: t('checkout.step_payment'), active: true, completed: true },
    { num: 3, label: t('checkout.step_review'), active: true, completed: false }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10 pb-28 sm:pb-12">
      <div className="page-container max-w-5xl space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.cart'), to: '/customer/cart' },
            { label: t('checkout.title') }
          ]}
          title={t('checkout.title')}
          subtitle={t('checkout.order_summary')}
        />

        {/* 3-Step Visual Stepper for low-literacy users */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {steps.map((st, idx) => (
              <div key={st.num} className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm transition ${
                    st.completed
                      ? 'bg-green-700 text-white shadow-xs'
                      : 'bg-green-50 text-green-800 ring-2 ring-green-300'
                  }`}
                >
                  {st.completed ? <CheckCircle2 size={18} /> : st.num}
                </div>
                <div>
                  <span
                    className={`text-xs sm:text-sm font-bold block ${
                      st.completed ? 'text-neutral-900' : 'text-neutral-600'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-8 sm:w-16 h-0.5 bg-neutral-200 mx-1 sm:mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Delivery Address & Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-neutral-900">
                      1. {t('checkout.delivery_address')}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {t('checkout.select_address')}
                    </p>
                  </div>
                </div>

                {!showAddForm && addresses.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                    className="text-xs font-bold"
                  >
                    <Plus size={14} className="mr-1" />
                    {t('checkout.add_new_address')}
                  </Button>
                )}
              </div>

              {showAddForm ? (
                <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      {t('checkout.add_new_address')}
                    </h3>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
                      >
                        {t('common.cancel')}
                      </button>
                    )}
                  </div>
                  <AddressForm
                    onSubmit={handleAddAddress}
                    onCancel={addresses.length > 0 ? () => setShowAddForm(false) : null}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition ${
                          isSelected
                            ? 'border-green-600 bg-green-50/50 shadow-sm ring-2 ring-green-500/20'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery_address"
                          value={addr.id}
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-neutral-900 text-base">
                              {addr.fullName}
                            </span>
                            <span className="text-xs font-semibold text-neutral-500 tabular-nums flex items-center gap-1">
                              <Phone size={12} className="text-neutral-400" />
                              {addr.phone}
                            </span>
                            {addr.defaultAddress && (
                              <Badge variant="neutral" size="sm">
                                {t('checkout.default_badge')}
                              </Badge>
                            )}
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto">
                                <CheckCircle2 size={13} />
                                {t('checkout.selected')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-700 mt-1.5 leading-relaxed">
                            {addr.line1}, {addr.city}, {addr.state} -{' '}
                            <span className="font-bold text-neutral-900">{addr.pincode}</span>
                          </p>
                        </div>
                      </label>
                    );
                  })}

                  {/* Add New Address big dashed card */}
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full border-2 border-dashed border-neutral-300 hover:border-green-600 hover:bg-green-50/20 p-4 sm:p-5 rounded-2xl flex items-center justify-center gap-2.5 text-neutral-700 hover:text-green-800 font-bold transition min-h-[64px]"
                  >
                    <Plus size={18} className="text-green-600" />
                    <span>{t('checkout.add_new_address')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                <div className="w-9 h-9 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <Banknote size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-neutral-900">
                    2. {t('checkout.payment_method')}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {t('checkout.pay_on_delivery')}
                  </p>
                </div>
              </div>

              {/* One Big Selected Card: Pay Cash When You Receive */}
              <div className="p-5 rounded-2xl border-2 border-green-600 bg-green-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center mt-0.5 shrink-0 shadow-xs">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="font-black text-neutral-900 text-base block">
                      {t('checkout.cash_on_delivery')}
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 leading-relaxed">
                      {t('checkout.cod_explanation')}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
                  <CheckCircle2 size={13} />
                  {t('checkout.selected')}
                </span>
              </div>

              {/* Multi-Farmer Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{t('checkout.split_warning')}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Step 3 Confirm & Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-sm sticky top-24 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <PackageCheck size={20} className="text-green-700" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                    3. {t('checkout.step_review')}
                  </h2>
                  <p className="text-xs text-neutral-500">{t('checkout.order_summary')}</p>
                </div>
              </div>

              {/* Scrollable Items */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-neutral-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200/80 shrink-0">
                      <img
                        src={getOptimizedImageUrl(item.imageUrl, 120)}
                        alt={item.name || 'Produce item'}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-neutral-500">
                        {item.quantity} × {formatINR(item.pricePerUnit)}
                      </p>
                    </div>
                    <span className="font-extrabold text-neutral-900 text-xs tabular-nums">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.item_count', { count: cart.itemCount })}</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{t('checkout.delivery_charges')}</span>
                  <span className="text-green-700 font-bold">{t('checkout.free_delivery')}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline font-black text-lg text-neutral-900">
                  <span>{t('checkout.grand_total')}</span>
                  <span className="text-2xl text-green-800 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Huge Place Order CTA with Double-Click Protection */}
              <Button
                variant="primary"
                size="lg"
                className="w-full min-h-[56px] text-base sm:text-lg font-black shadow-lg rounded-2xl"
                disabled={placingOrder || !selectedAddressId || showAddForm}
                loading={placingOrder}
                onClick={handleCheckout}
              >
                <span>{placingOrder ? t('checkout.placing_order') : t('checkout.place_order_btn')}</span>
                {!placingOrder && <ArrowRight size={19} className="ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
