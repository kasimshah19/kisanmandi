import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import { farmerStatsService } from '../../services/phase5Services';
import { farmerOrderService } from '../../services/farmerOrderService';
import ChartCard from '../../components/ChartCard';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ListenButton from '../../components/ListenButton';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { formatINR, unitLabel } from '../../utils/format';
import {
  TrendingUp,
  Star,
  DollarSign,
  Package,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  Tractor,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export function computeOnboardingStep(profile, productsCount = 0) {
  const approvalStatus = profile?.approvalStatus || 'NOT_SUBMITTED';
  const isApproved = approvalStatus === 'APPROVED';

  const stepProfileComplete = Boolean(profile?.farmName && profile?.district && profile?.state);
  const stepDocUploaded = Boolean(profile?.documentSubmitted || profile?.documentUrl || (stepProfileComplete && approvalStatus !== 'NOT_SUBMITTED'));
  const stepApproved = isApproved;
  const stepProductAdded = productsCount > 0;

  let currentStep = 1;
  let nextActionKey = 'COMPLETE_PROFILE';

  if (!stepProfileComplete) {
    currentStep = 1;
    nextActionKey = 'COMPLETE_PROFILE';
  } else if (!stepDocUploaded) {
    currentStep = 2;
    nextActionKey = 'UPLOAD_DOCUMENT';
  } else if (approvalStatus === 'REJECTED') {
    currentStep = 3;
    nextActionKey = 'CHECK_STATUS_REJECTED';
  } else if (approvalStatus === 'PENDING') {
    currentStep = 3;
    nextActionKey = 'WAIT_FOR_APPROVAL';
  } else if (!stepProductAdded) {
    currentStep = 4;
    nextActionKey = 'ADD_FIRST_PRODUCT';
  } else {
    currentStep = 5;
    nextActionKey = 'ALL_DONE';
  }

  return {
    approvalStatus,
    stepProfileComplete,
    stepDocUploaded,
    stepApproved,
    stepProductAdded,
    currentStep,
    nextActionKey,
  };
}

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  useDocumentTitle(`${t('farmer.dashboard_title')} | KisanMandi`);

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, productsRes, statsRes, ordersRes] = await Promise.all([
        farmerService.getProfile(),
        productService.getMyProducts().catch(() => ({ data: [] })),
        farmerStatsService.getStats().catch(() => null),
        farmerOrderService.summary().catch(() => ({ data: {} })),
      ]);
      setProfile(profileRes.data);
      setProducts(productsRes.data || []);
      setStats(statsRes);
      setOrderSummary(ordersRes.data || {});
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Farmer';
  const approvalStatus = profile?.approvalStatus || 'NOT_SUBMITTED';
  const isApproved = approvalStatus === 'APPROVED';

  // Compute Onboarding Checklist from Real State
  const onboarding = computeOnboardingStep(profile, products.length);
  const { stepProfileComplete, stepDocUploaded, stepApproved, stepProductAdded } = onboarding;

  let nextAction = {
    title: t('farmer.add_new_product', 'Add your first product'),
    to: '/farmer/products/add',
    icon: PlusCircle,
  };

  if (onboarding.nextActionKey === 'COMPLETE_PROFILE') {
    nextAction = {
      title: t('farmer.onboard_step1_btn', 'Fill farm details'),
      to: '/farmer/profile',
      icon: FileText,
    };
  } else if (onboarding.nextActionKey === 'UPLOAD_DOCUMENT') {
    nextAction = {
      title: t('farmer.onboard_step2_btn', 'Upload farm paper'),
      to: '/farmer/profile',
      icon: ShieldCheck,
    };
  } else if (onboarding.nextActionKey === 'CHECK_STATUS_REJECTED') {
    nextAction = {
      title: t('farmer.fix_and_send_again', 'Fix and send again'),
      to: '/farmer/profile',
      icon: RefreshCw,
    };
  } else if (onboarding.nextActionKey === 'WAIT_FOR_APPROVAL') {
    nextAction = {
      title: t('farmer.view_profile_status', 'Check profile status'),
      to: '/farmer/profile',
      icon: Clock,
    };
  } else if (onboarding.nextActionKey === 'ADD_FIRST_PRODUCT') {
    nextAction = {
      title: t('farmer.add_first_product_btn', 'Add your first product'),
      to: '/farmer/products/add',
      icon: PlusCircle,
    };
  }

  // Low stock alert items (<= 5 units)
  const lowStockProducts = products.filter(
    (p) => p.active && !p.deleted && Number(p.quantityAvailable) <= 5
  );

  const newOrdersCount = orderSummary?.placed ?? 0;
  const todayEarnings = stats?.totalEarnings ?? 0;
  const activeProductsCount = products.filter((p) => p.active && !p.deleted).length;

  const todaySummarySentence = `Namaste ${firstName}. You have ${newOrdersCount} new orders and earned ${formatINR(todayEarnings)} so far.`;

  return (
    <DashboardLayout role="FARMER">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title={t('errors.generic_retry')}
          message={error}
          onRetry={loadDashboard}
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Greeting Header & Today Summary */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Namaste, {firstName}! 🙏
                </span>
                <StatusBadge status={approvalStatus} size="sm" />
              </div>
              <p className="text-sm sm:text-base text-neutral-600 font-medium">
                {newOrdersCount > 0 ? (
                  <>
                    You have <span className="font-bold text-neutral-900">{newOrdersCount} new orders</span> waiting today.
                  </>
                ) : (
                  <>Here is your farm summary for today.</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ListenButton text={todaySummarySentence} size="md" variant="secondary" />
              <Button
                as={Link}
                to="/farmer/products/add"
                variant="primary"
                size="md"
                leftIcon={<PlusCircle size={18} />}
              >
                {t('farmer.add_new_product')}
              </Button>
            </div>
          </div>

          {/* IF NOT APPROVED: Big Onboarding Checklist */}
          {!isApproved && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-200 shadow-sm relative overflow-hidden space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-sm">
                      🌱
                    </span>
                    <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                      {t('farmer.onboard_title', 'Start selling in 4 easy steps')}
                    </h2>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {t('farmer.onboard_subtitle', 'Complete these simple steps so nearby families can buy directly from your farm.')}
                  </p>
                </div>

                <Button
                  as={Link}
                  to={nextAction.to}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight size={18} />}
                  className="w-full md:w-auto shadow-sm"
                >
                  {nextAction.title}
                </Button>
              </div>

              {/* Rejection Notice with Plain Words and "Fix and send again" */}
              {approvalStatus === 'REJECTED' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-red-900">
                        {t('farmer.rejected_title', 'Your farm paper needs a quick update')}
                      </h4>
                      <p className="text-xs sm:text-sm text-red-800 mt-0.5">
                        {profile?.rejectionReason || profile?.adminNotes || t('farmer.rejected_default_msg', 'The document uploaded could not be verified clearly. Please take a clearer photo of your 7/12 extract or ID card.')}
                      </p>
                    </div>
                  </div>
                  <Button
                    as={Link}
                    to="/farmer/profile"
                    variant="outline"
                    size="sm"
                    className="shrink-0 bg-white hover:bg-red-100 text-red-900 border-red-300 font-bold"
                  >
                    {t('farmer.fix_and_send_again', 'Fix and send again')}
                  </Button>
                </div>
              )}

              {/* 4 Big Checklist Step Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Step 1: Fill farm details */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                    stepProfileComplete
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-brand-700 shadow-2xs">
                        <FileText size={18} />
                      </div>
                      <Badge variant={stepProfileComplete ? 'success' : 'neutral'} size="sm">
                        {stepProfileComplete ? t('status.done', 'Done') : t('status.todo', 'To do')}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      1. {t('farmer.step1_title', 'Fill your farm details')}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {profile?.farmName ? `${profile.farmName}, ${profile.district}` : 'Name, village & district'}
                    </p>
                  </div>
                  {!stepProfileComplete && (
                    <Link
                      to="/farmer/profile"
                      className="mt-3 text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                    >
                      Fill now &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 2: Upload farm paper */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                    stepDocUploaded
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-brand-700 shadow-2xs">
                        <ShieldCheck size={18} />
                      </div>
                      <Badge variant={stepDocUploaded ? 'success' : 'neutral'} size="sm">
                        {stepDocUploaded ? t('status.done', 'Done') : t('status.todo', 'To do')}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      2. {t('farmer.step2_title', 'Upload your farm paper')}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {stepDocUploaded ? 'Paper uploaded' : '7/12 extract or ID photo'}
                    </p>
                  </div>
                  {!stepDocUploaded && (
                    <Link
                      to="/farmer/profile"
                      className="mt-3 text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                    >
                      Upload photo &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 3: Wait for admin to check */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                    stepApproved
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : approvalStatus === 'PENDING'
                      ? 'bg-amber-50/80 border-amber-300'
                      : approvalStatus === 'REJECTED'
                      ? 'bg-red-50/80 border-red-300'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-brand-700 shadow-2xs">
                        <Clock size={18} />
                      </div>
                      <Badge
                        variant={
                          stepApproved
                            ? 'success'
                            : approvalStatus === 'PENDING'
                            ? 'amber'
                            : approvalStatus === 'REJECTED'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {stepApproved
                          ? t('status.done', 'Done')
                          : approvalStatus === 'PENDING'
                          ? t('status.waiting', 'Waiting')
                          : approvalStatus === 'REJECTED'
                          ? t('status.rejected', 'Check')
                          : t('status.todo', 'To do')}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      3. {t('farmer.step3_title', 'Wait for admin check')}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {stepApproved
                        ? 'Account approved'
                        : approvalStatus === 'PENDING'
                        ? 'Admin is checking your details'
                        : approvalStatus === 'REJECTED'
                        ? 'Needs re-upload'
                        : 'After step 1 & 2'}
                    </p>
                  </div>
                  {approvalStatus === 'REJECTED' && (
                    <Link
                      to="/farmer/profile"
                      className="mt-3 text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1"
                    >
                      Fix document &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 4: Add first product */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                    stepProductAdded
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-brand-700 shadow-2xs">
                        <PlusCircle size={18} />
                      </div>
                      <Badge variant={stepProductAdded ? 'success' : 'neutral'} size="sm">
                        {stepProductAdded ? t('status.done', 'Done') : t('status.todo', 'To do')}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      4. {t('farmer.step4_title', 'Add your first product')}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {stepProductAdded ? `${products.length} produce listed` : 'Tomato, Potato, Wheat, etc.'}
                    </p>
                  </div>
                  {isApproved && !stepProductAdded && (
                    <Link
                      to="/farmer/products/add"
                      className="mt-3 text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                    >
                      Add produce &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4 BIG TAPPABLE TILES (Phone-First Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Tile 1: New Orders */}
            <Link
              to="/farmer/orders"
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:scale-105 transition">
                  <ClipboardList size={24} />
                </div>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full group-hover:bg-brand-700 group-hover:text-white transition">
                  {t('farmer.action_orders', 'Orders')} &rarr;
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono tabular-nums block">
                  {newOrdersCount}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-600 block mt-0.5">
                  {t('farmer.new_orders_label', 'New Orders')}
                </span>
              </div>
            </Link>

            {/* Tile 2: Today's Earnings */}
            <Link
              to="/farmer/earnings"
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                  <DollarSign size={24} />
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full group-hover:bg-emerald-700 group-hover:text-white transition">
                  {t('farmer.action_earnings', 'Earnings')} &rarr;
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums block truncate">
                  {formatINR(todayEarnings)}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-600 block mt-0.5">
                  {t('farmer.total_earnings', 'Total Earnings')}
                </span>
              </div>
            </Link>

            {/* Tile 3: My Products */}
            <Link
              to="/farmer/products"
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition group flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                  <Package size={24} />
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-700 group-hover:text-white transition">
                  {t('farmer.action_products', 'Products')} &rarr;
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono tabular-nums block">
                  {products.length}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-600 block mt-0.5">
                  {t('farmer.total_products', 'My Products')}
                </span>
              </div>
            </Link>

            {/* Tile 4: Today's Mandi Rates */}
            <Link
              to="/farmer/mandi"
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
                  <Tractor size={24} />
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full group-hover:bg-amber-700 group-hover:text-white transition">
                  {t('farmer.action_rates', 'Rates')} &rarr;
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 block truncate">
                  Agmarknet
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-600 block mt-0.5">
                  {t('nav.mandi_rates', 'Today\'s Rates')}
                </span>
              </div>
            </Link>
          </div>

          {/* Rating, Low Stock Alerts & Sales Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* 30-Day Earnings Chart (2 columns) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs space-y-4">
                <div className="pb-2 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                      {t('farmer.sales_trend', '30-Day Sales')}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                      {t('farmer.sales_trend_plain', 'Here is how much you earned from customer orders over the last 30 days.')}
                    </p>
                  </div>
                  {stats?.totalEarnings > 0 && (
                    <span className="text-sm font-bold text-brand-800">
                      Total: {formatINR(stats.totalEarnings)}
                    </span>
                  )}
                </div>

                <ChartCard
                  title=""
                  data={stats?.salesByMonth || []}
                  type="bar"
                  dataKey="sales"
                  emptyMessage={t('farmer.no_sales_recorded', 'No customer orders fulfilled yet. As soon as you deliver orders, your earnings chart will appear here.')}
                />
              </div>
            </div>

            {/* Right Column: Rating Card & Low Stock Alerts */}
            <div className="space-y-6">
              {/* Rating Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    {t('reviews.average_rating', 'Customer Rating')}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                      {stats?.averageRating ? `${stats.averageRating} ★` : '5.0 ★'}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      ({stats?.totalReviews ?? 0} {t('reviews.reviews_count', 'ratings')})
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {stats?.totalReviews > 0 ? 'From happy neighborhood buyers' : 'New verified farmer'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star size={24} className="fill-amber-400 text-amber-400" />
                </div>
              </div>

              {/* Plain Words Low Stock Alerts */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                    <AlertTriangle size={17} className="text-amber-600" />
                    {t('farmer.low_stock_title', 'Low Stock Produce')}
                  </h3>
                  {lowStockProducts.length > 0 && (
                    <Badge variant="amber" size="sm">
                      {lowStockProducts.length}
                    </Badge>
                  )}
                </div>

                {lowStockProducts.length > 0 ? (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate">{p.name}</p>
                          <p className="text-amber-900 font-semibold mt-0.5">
                            {p.name}: only {p.quantityAvailable} {unitLabel(p.unit, t)} left
                          </p>
                        </div>
                        <Link
                          to={`/farmer/products/edit/${p.id}`}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-bold text-amber-950 hover:bg-amber-100 transition min-h-[38px] flex items-center justify-center"
                        >
                          {t('farmer.add_stock_btn', 'Add stock')}
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 py-3 text-center font-medium">
                    {t('farmer.stock_healthy_msg', 'All your listed crops have plenty of stock.')}
                  </p>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-xs space-y-3">
                <h3 className="font-extrabold text-neutral-900 text-sm">
                  {t('farmer.quick_actions', 'Quick Actions')}
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/farmer/products/add"
                    className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-brand-50 border border-neutral-200/80 hover:border-brand-300 transition text-left group min-h-[64px]"
                  >
                    <PlusCircle size={20} className="text-brand-700 mb-1" />
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-brand-900">
                      Add Product
                    </p>
                  </Link>
                  <Link
                    to="/farmer/mandi"
                    className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-brand-50 border border-neutral-200/80 hover:border-brand-300 transition text-left group min-h-[64px]"
                  >
                    <Tractor size={20} className="text-brand-700 mb-1" />
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-brand-900">
                      Mandi Rates
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
