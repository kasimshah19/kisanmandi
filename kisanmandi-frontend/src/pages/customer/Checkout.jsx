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
  ChevronDown,
  ChevronUp,
  PackageCheck
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
      setAddresses(addrRes.data);

      // Auto-select default or first address
      if (addrRes.data.length > 0) {
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
      await orderService.checkout(selectedAddressId, 'COD');
      toast.success(t('checkout.order_success_title'));
      refreshCart();
      navigate('/customer/orders');
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
    { label: t('checkout.step_address'), active: true, completed: !!selectedAddressId },
    { label: t('checkout.step_payment'), active: true, completed: true },
    { label: t('checkout.step_review'), active: true, completed: false }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10 pb-28 sm:pb-12">
      <div className="page-container max-w-5xl">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.cart'), to: '/customer/cart' },
            { label: t('checkout.title') }
          ]}
          title={t('checkout.title')}
          subtitle={t('checkout.order_summary')}
        />

        {/* Visual 3-Step Orientation Indicator */}
        <div className="my-6 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((st, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    st.completed
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'bg-brand-50 text-brand-800 ring-2 ring-brand-300'
                  }`}
                >
                  {st.completed ? <CheckCircle2 size={16} /> : sIdx + 1}
                </div>
                <span
                  className={`text-xs font-bold ${
                    st.completed ? 'text-neutral-900' : 'text-neutral-600'
                  }`}
                >
                  {st.label}
                </span>
                {sIdx < steps.length - 1 && (
                  <div className="w-8 sm:w-16 h-0.5 bg-neutral-200 mx-1 sm:mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Address Selection & Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      {t('checkout.delivery_address')}
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
                    className="text-xs"
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
                        className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs'
                            : 'border-neutral-200 hover:bg-neutral-50/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm">
                              {addr.fullName}
                            </span>
                            <span className="text-xs font-medium text-neutral-500 tabular-nums">
                              {addr.phone}
                            </span>
                            {addr.defaultAddress && (
                              <Badge variant="neutral" size="sm">
                                {t('checkout.default_badge')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                            {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Banknote size={17} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    {t('checkout.payment_method')}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {t('checkout.pay_on_delivery')}
                  </p>
                </div>
              </div>

              {/* Single COD Card */}
              <div className="p-4 rounded-2xl border-2 border-brand-600 bg-brand-50/50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full text-brand-700 bg-white border border-brand-200 mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 text-sm block">
                      {t('checkout.cash_on_delivery')}
                    </span>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      {t('checkout.cod_explanation')}
                    </p>
                  </div>
                </div>
                <Badge variant="brand" size="sm">
                  {t('checkout.cod_badge')}
                </Badge>
              </div>

              {/* Notice regarding separate farm shipments */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{t('checkout.split_warning')}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <PackageCheck size={19} className="text-brand-700" />
                {t('checkout.order_summary')}
              </h2>

              {/* Scrollable list of items */}
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
                      <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-neutral-500">
                        {item.quantity} × {formatINR(item.pricePerUnit)}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900 text-xs tabular-nums">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.item_count', { count: cart.itemCount })}</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{t('checkout.delivery_charges')}</span>
                  <span className="text-brand-700 font-bold">{t('checkout.free_delivery')}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline font-black text-lg text-neutral-900">
                  <span>{t('checkout.grand_total')}</span>
                  <span className="text-2xl text-brand-800 tabular-nums">
                    {formatINR(cart.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-bold shadow-md"
                disabled={placingOrder || !selectedAddressId || showAddForm}
                loading={placingOrder}
                onClick={handleCheckout}
              >
                <span>{t('checkout.place_order_btn')}</span>
                <ArrowRight size={18} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
