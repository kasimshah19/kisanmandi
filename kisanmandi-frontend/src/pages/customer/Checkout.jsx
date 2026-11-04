import { useState, useEffect, useRef } from 'react';
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
  Phone,
  CreditCard,
  X,
  Clock,
  RotateCw
} from 'lucide-react';
import { addressService } from '../../services/addressService';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { getPublicConfig } from '../../services/configService';
import { verifyPayment, retryPayment, cancelPaymentGroup } from '../../services/paymentService';
import { loadRazorpayScript } from '../../utils/razorpay';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState({ paymentEnabled: false, razorpayKeyId: '' });
  const [paymentMode, setPaymentMode] = useState('COD');
  const [loading, setLoading] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [simulatedModal, setSimulatedModal] = useState(null);

  // Calm state when online payment is interrupted / dismissed
  const [awaitingPaymentState, setAwaitingPaymentState] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 15, seconds: 0, expired: false });

  // Idempotency key stored in ref, reset on address or cart change
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, [selectedAddressId, cart?.items]);

  // Countdown timer for calm state
  useEffect(() => {
    if (!awaitingPaymentState?.expiresAt) return;

    const updateTimer = () => {
      const expiry = new Date(awaitingPaymentState.expiresAt).getTime();
      const diff = expiry - Date.now();
      if (diff <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0, expired: true });
      } else {
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeRemaining({ minutes: m, seconds: s, expired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [awaitingPaymentState?.expiresAt]);

  const loadData = async () => {
    try {
      const [cartRes, addrRes, configRes] = await Promise.all([
        cartService.get(),
        addressService.getAll(),
        getPublicConfig().catch(() => ({ paymentEnabled: false }))
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
      setPaymentConfig(configRes || { paymentEnabled: false });

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

  const launchRazorpay = (checkoutData, primaryOrder, paymentDetails) => {
    const keyId = paymentDetails.keyId || paymentConfig.razorpayKeyId;

    // Check if key is a test/fake stub
    if (!keyId || keyId.startsWith('fake_') || keyId.includes('mock') || keyId.includes('simulated')) {
      setSimulatedModal({
        order: primaryOrder,
        paymentDetails,
        paymentGroupId: primaryOrder.paymentGroupId
      });
      return;
    }

    if (window.Razorpay) {
      const rzpOptions = {
        key: keyId,
        amount: paymentDetails.amountPaise,
        currency: paymentDetails.currency || 'INR',
        name: 'KisanMandi',
        description: `Order #${primaryOrder.id}`,
        order_id: paymentDetails.razorpayOrderId,
        handler: async function (response) {
          try {
            await verifyPayment({
              paymentGroupId: primaryOrder.paymentGroupId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success(t('checkout.payment_success', 'Payment successful!'));
            refreshCart();
            navigate('/customer/orders', { state: { justPlacedOrder: primaryOrder } });
          } catch {
            toast.error(t('checkout.payment_verify_failed', 'Payment verification failed'));
            navigate('/customer/orders');
          }
        },
        prefill: {
          name: paymentDetails.customerPrefill?.name || user?.name,
          email: paymentDetails.customerPrefill?.email || user?.email,
          contact: paymentDetails.customerPrefill?.contact || user?.phone
        },
        theme: { color: '#15803d' },
        modal: {
          ondismiss: function () {
            setAwaitingPaymentState({
              paymentGroupId: primaryOrder.paymentGroupId,
              orderId: primaryOrder.id,
              expiresAt: paymentDetails.expiresAt,
              totalAmount: cart?.totalAmount,
              paymentDetails,
              primaryOrder
            });
            toast(t('checkout.payment_dismissed', 'Payment not completed. Your items are kept for 15 minutes.'), {
              icon: '⏳'
            });
          }
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (resp) {
        setAwaitingPaymentState({
          paymentGroupId: primaryOrder.paymentGroupId,
          orderId: primaryOrder.id,
          expiresAt: paymentDetails.expiresAt,
          totalAmount: cart?.totalAmount,
          paymentDetails,
          primaryOrder
        });
        toast.error(resp.error?.description || t('checkout.payment_failed', 'Payment failed'));
      });
      rzp.open();
    } else {
      // Razorpay checkout script not available, fallback to simulation
      setSimulatedModal({
        order: primaryOrder,
        paymentDetails,
        paymentGroupId: primaryOrder.paymentGroupId
      });
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error(t('checkout.select_address_error'));
      return;
    }
    setPlacingOrder(true);
    try {
      if (paymentMode === 'ONLINE') {
        await loadRazorpayScript();
      }

      const res = await orderService.checkout(selectedAddressId, paymentMode, idempotencyKeyRef.current);
      const checkoutData = res.data;
      const orders = checkoutData.orders || [];
      const primaryOrder = orders[0] || { id: Date.now() };

      if (paymentMode === 'ONLINE' && checkoutData.payment) {
        launchRazorpay(checkoutData, primaryOrder, checkoutData.payment);
      } else {
        toast.success(t('checkout.order_success_title'));
        refreshCart();
        navigate('/customer/orders', { state: { justPlacedOrder: primaryOrder } });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || 'A checkout request is already processing or items changed.');
      } else if (error.response?.status === 422) {
        toast.error(error.response?.data?.message || 'Checkout details mismatch. Please try again.');
        idempotencyKeyRef.current = crypto.randomUUID();
      } else {
        toast.error(error.response?.data?.message || t('errors.generic_retry'));
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!awaitingPaymentState) return;
    setPlacingOrder(true);
    try {
      await loadRazorpayScript();
      const paymentDetails = await retryPayment(awaitingPaymentState.paymentGroupId);
      setAwaitingPaymentState((prev) => ({
        ...prev,
        expiresAt: paymentDetails.expiresAt,
        paymentDetails
      }));
      launchRazorpay(null, awaitingPaymentState.primaryOrder, paymentDetails);
    } catch (err) {
      toast.error(err.response?.data?.message || t('checkout.payment_expired', 'Payment window has expired'));
      navigate('/customer/orders');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCancelAwaitingOrder = async () => {
    if (!awaitingPaymentState) return;
    try {
      await cancelPaymentGroup(awaitingPaymentState.paymentGroupId);
      toast.success(t('orders.timeline_cancelled', 'Order cancelled'));
      setAwaitingPaymentState(null);
      refreshCart();
      navigate('/customer/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!simulatedModal) return;
    try {
      await verifyPayment({
        paymentGroupId: simulatedModal.paymentGroupId,
        razorpayOrderId: simulatedModal.paymentDetails.razorpayOrderId,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
        razorpaySignature: 'mock_sig_valid'
      });
      toast.success(t('checkout.payment_success', 'Payment successful!'));
      refreshCart();
      const placed = simulatedModal.order;
      setSimulatedModal(null);
      navigate('/customer/orders', { state: { justPlacedOrder: placed } });
    } catch {
      toast.error(t('checkout.payment_verify_failed', 'Payment verification failed'));
      setSimulatedModal(null);
      navigate('/customer/orders');
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
            {steps.map((st) => (
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
              </div>
            ))}
          </div>
        </div>

        {/* CALM STATE BANNER: When Payment was not completed / dismissed */}
        {awaitingPaymentState && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock size={24} className="stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-amber-900">
                  {t('checkout.payment_not_completed', 'Payment not completed')}
                </h3>
                <p className="text-sm text-amber-800 mt-1">
                  {t('checkout.items_kept_message', 'Your items are safely reserved for 15 minutes. Complete your payment to confirm your order.')}
                </p>
                <div className="mt-2 flex items-center gap-2 font-mono text-xs font-bold text-amber-900">
                  <span className="bg-amber-200/80 px-2.5 py-1 rounded-full">
                    {timeRemaining.expired
                      ? t('checkout.payment_expired', 'Reservation expired')
                      : t('checkout.time_left', 'Time remaining: {{time}}', {
                          time: `${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`
                        })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200">
              <Button
                variant="primary"
                onClick={handleRetryPayment}
                disabled={timeRemaining.expired || placingOrder}
                loading={placingOrder}
                className="text-sm font-bold"
              >
                <RotateCw size={15} className="mr-1.5" />
                {t('checkout.try_payment_again', 'Try payment again')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelAwaitingOrder}
                className="text-sm font-bold text-red-600 border-red-200 hover:bg-red-50"
              >
                {t('common.cancel_order', 'Cancel order')}
              </Button>
              <Button
                as={Link}
                to="/customer/orders"
                variant="ghost"
                className="text-sm font-bold text-neutral-700 ml-auto"
              >
                {t('checkout.view_my_orders', 'View in My Orders')} &rarr;
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Steps 1 & 2 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address Selection */}
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
                      {addresses.length > 0
                        ? t('checkout.choose_saved_address')
                        : t('checkout.no_addresses_yet')}
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
                    {t('common.add')}
                  </Button>
                )}
              </div>

              {showAddForm ? (
                <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200/80">
                  <h3 className="font-bold text-neutral-900 text-sm mb-3">
                    {t('checkout.add_new_address')}
                  </h3>
                  <AddressForm
                    onSubmit={handleAddAddress}
                    onCancel={() => {
                      if (addresses.length > 0) setShowAddForm(false);
                    }}
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
                    {paymentConfig?.paymentEnabled
                      ? t('checkout.choose_payment_method', 'Choose your preferred payment method')
                      : t('checkout.pay_on_delivery')}
                  </p>
                </div>
              </div>

              {/* Payment Mode Options */}
              <div className="space-y-3">
                {/* Cash on Delivery (COD) Card */}
                <label
                  className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs cursor-pointer transition ${
                    paymentMode === 'COD'
                      ? 'border-green-600 bg-green-50/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="payment_mode"
                      value="COD"
                      checked={paymentMode === 'COD'}
                      onChange={() => setPaymentMode('COD')}
                      className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote size={18} className="text-green-700" />
                        <span className="font-black text-neutral-900 text-base">
                          {t('checkout.cash_on_delivery')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                        {t('checkout.cod_explanation')}
                      </p>
                    </div>
                  </div>
                  {paymentMode === 'COD' && (
                    <span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
                      <CheckCircle2 size={13} />
                      {t('checkout.selected')}
                    </span>
                  )}
                </label>

                {/* Online Payment Card (Visible if paymentEnabled) */}
                {paymentConfig?.paymentEnabled && (
                  <label
                    className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs cursor-pointer transition ${
                      paymentMode === 'ONLINE'
                        ? 'border-green-600 bg-green-50/50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="radio"
                        name="payment_mode"
                        value="ONLINE"
                        checked={paymentMode === 'ONLINE'}
                        onChange={() => setPaymentMode('ONLINE')}
                        className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-green-700" />
                          <span className="font-black text-neutral-900 text-base">
                            {t('checkout.online_payment', 'Online Payment (UPI, Cards, NetBanking)')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                          {t('checkout.online_explanation', 'Pay securely via UPI, Debit/Credit Card, or NetBanking.')}
                        </p>
                      </div>
                    </div>
                    {paymentMode === 'ONLINE' && (
                      <span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
                        <CheckCircle2 size={13} />
                        {t('checkout.selected')}
                      </span>
                    )}
                  </label>
                )}
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
                  <p className="text-xs text-neutral-500">
                    {t('checkout.review_order')}
                  </p>
                </div>
              </div>

              {/* Items List in Summary */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs sm:text-sm">
                    <img
                      src={getOptimizedImageUrl(item.productImage)}
                      alt={item.productName}
                      className="w-11 h-11 rounded-xl object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-neutral-500 text-xs">
                        {item.quantity} {item.unit} &times; {formatINR(item.pricePerUnit)}
                      </p>
                    </div>
                    <span className="font-black text-neutral-900 tabular-nums">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.item_total')}</span>
                  <span className="font-bold tabular-nums text-neutral-900">
                    {formatINR(cart?.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.delivery_fee')}</span>
                  <span className="font-bold text-green-700 uppercase tracking-wider text-xs">
                    {t('cart.free')}
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-neutral-200 flex justify-between items-baseline">
                  <span className="font-black text-neutral-900 text-sm sm:text-base">
                    {t('common.total')}
                  </span>
                  <span className="text-2xl font-black text-green-800 tabular-nums">
                    {formatINR(cart?.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Big Green Primary CTA */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={placingOrder}
                onClick={handleCheckout}
                disabled={!selectedAddressId}
                className="py-4 text-base font-black shadow-md shadow-green-700/20"
              >
                <span>{paymentMode === 'ONLINE' ? t('checkout.pay_and_place', 'Pay & Place Order') : t('checkout.place_order_btn', 'Confirm & Place Order')}</span>
                <ArrowRight size={18} className="ml-1.5" />
              </Button>

              {/* Trust Badges */}
              <div className="space-y-1.5 pt-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600">
                  <ShieldCheck size={16} className="text-green-700 shrink-0" />
                  <span>{t('checkout.direct_from_farmers_trust')}</span>
                </div>
                {paymentMode === 'ONLINE' && (
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                    <CreditCard size={14} className="text-blue-600 shrink-0" />
                    <span>{t('checkout.razorpay_trust_badge', '100% Secure Payment powered by Razorpay')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test / Simulated Payment Modal */}
      {simulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-gray-900 dark:text-gray-100">
                  {t('checkout.gateway_simulation', 'Razorpay Gateway (Test Mode)')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSimulatedModal(null);
                  navigate('/customer/orders');
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('orders.order_id', 'Order ID')}</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-200">
                  #{simulatedModal.order.id}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('checkout.gateway_order_id', 'Gateway Order ID')}</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {simulatedModal.paymentDetails.razorpayOrderId}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>{t('common.total', 'Total Amount')}</span>
                <span className="text-emerald-700">{formatINR(simulatedModal.paymentDetails.amountPaise ? simulatedModal.paymentDetails.amountPaise / 100 : cart?.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSimulatedModal(null);
                  navigate('/customer/orders');
                }}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSimulatePaymentSuccess}
              >
                {t('checkout.simulate_success', 'Simulate Success')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
