import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import { farmerStatsService } from '../../services/phase5Services';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Star,
  DollarSign,
  Package,
  Eye,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Tractor,
  FileText,
  ShieldCheck,
  ChevronRight
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, productsRes, statsRes] = await Promise.all([
        farmerService.getProfile(),
        productService.getMyProducts().catch(() => ({ data: [] })),
        farmerStatsService.getStats().catch(() => null),
      ]);
      setProfile(profileRes.data);
      setProducts(productsRes.data || []);
      setStats(statsRes);
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
    title: t('farmer.add_new_product'),
    to: '/farmer/products/add',
    icon: PlusCircle,
  };

  if (onboarding.nextActionKey === 'COMPLETE_PROFILE') {
    nextAction = {
      title: 'Complete Farm Profile',
      to: '/farmer/profile',
      icon: FileText,
    };
  } else if (onboarding.nextActionKey === 'UPLOAD_DOCUMENT') {
    nextAction = {
      title: 'Upload Verification Document',
      to: '/farmer/profile',
      icon: FileText,
    };
  } else if (onboarding.nextActionKey === 'CHECK_STATUS_REJECTED') {
    nextAction = {
      title: 'Resubmit Application',
      to: '/farmer/profile',
      icon: Clock,
    };
  } else if (onboarding.nextActionKey === 'WAIT_FOR_APPROVAL') {
    nextAction = {
      title: 'Wait for Approval',
      to: '/farmer/profile',
      icon: Clock,
    };
  } else if (onboarding.nextActionKey === 'ADD_FIRST_PRODUCT') {
    nextAction = {
      title: 'List First Produce',
      to: '/farmer/products/add',
      icon: PlusCircle,
    };
  }

  // Low stock alert items (<= 5 units)
  const lowStockProducts = products.filter(
    (p) => p.active && !p.deleted && Number(p.quantityAvailable) <= 5
  );

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
          {/* Page Header with Greeting */}
          <PageHeader
            breadcrumbs={[
              { label: t('nav.home'), to: '/' },
              { label: t('nav.dashboard') },
            ]}
            title={`Namaste, ${firstName}!`}
            subtitle="Manage your harvest, track buyer orders, and benchmark mandi rates."
            actions={
              <Button
                as={Link}
                to="/farmer/products/add"
                variant="primary"
                size="md"
                leftIcon={<PlusCircle size={16} />}
              >
                {t('farmer.add_new_product')}
              </Button>
            }
          />

          {/* Onboarding Checklist Card (Shown if not fully set up or not approved) */}
          {(!isApproved || products.length === 0) && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-brand-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                      ⚡
                    </span>
                    <h3 className="font-extrabold text-lg text-neutral-900 tracking-tight">
                      Producer Onboarding Checklist
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Complete these simple steps to start receiving direct buyer orders on KisanMandi.
                  </p>
                </div>

                <Button
                  as={Link}
                  to={nextAction.to}
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight size={15} />}
                >
                  {nextAction.title}
                </Button>
              </div>

              {/* 4 Checklist Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Step 1 */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stepProfileComplete
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Step 1</span>
                    {stepProfileComplete ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-neutral-900">Complete Profile</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Farm name & location</p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stepDocUploaded
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Step 2</span>
                    {stepDocUploaded ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-neutral-900">Upload Document</p>
                  <p className="text-xs text-neutral-500 mt-0.5">7/12 extract or ID</p>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stepApproved
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : approvalStatus === 'PENDING'
                      ? 'bg-amber-50/60 border-amber-200'
                      : approvalStatus === 'REJECTED'
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Step 3</span>
                    <StatusBadge status={approvalStatus} size="sm" />
                  </div>
                  <p className="text-sm font-bold text-neutral-900">Admin Approval</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {approvalStatus === 'APPROVED'
                      ? 'Verified producer'
                      : approvalStatus === 'PENDING'
                      ? 'Review in progress'
                      : 'Verification required'}
                  </p>
                </div>

                {/* Step 4 */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stepProductAdded
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Step 4</span>
                    {stepProductAdded ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-neutral-900">List First Produce</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Price per kg/quintal</p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Status Notice if Pending or Rejected */}
          {approvalStatus === 'PENDING' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Clock size={20} className="text-amber-700 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Verification Under Review
                </p>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  Your agricultural document is currently being reviewed by the admin team. Once verified, your produce listings will be immediately visible to household buyers.
                </p>
              </div>
            </div>
          )}

          {approvalStatus === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">
                  Verification Rejected
                </p>
                <p className="text-xs sm:text-sm text-red-800 mt-0.5">
                  Please visit your profile to re-upload a clear document copy or contact admin support.
                </p>
                <Link
                  to="/farmer/profile"
                  className="inline-block mt-2 text-xs font-bold text-red-900 underline underline-offset-2"
                >
                  Update Profile Documents &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* 4 Primary Metric StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title={t('farmer.total_earnings')}
              value={stats?.totalEarnings ?? 0}
              type="currency"
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title={t('farmer.pending_payouts')}
              value={stats?.pendingPayouts ?? 0}
              type="currency"
              icon={TrendingUp}
              color="amber"
              hint="Pending fulfillment"
            />
            <StatCard
              title={t('reviews.average_rating')}
              value={stats?.averageRating ? `${stats.averageRating} ★` : 'New'}
              icon={Star}
              color="brand"
              hint={stats?.totalReviews ? `${stats.totalReviews} buyer ratings` : 'No reviews yet'}
            />
            <StatCard
              title={t('farmer.total_products')}
              value={products.length}
              icon={Package}
              color="purple"
              hint={`${products.filter((p) => p.active && !p.deleted).length} active listings`}
            />
          </div>

          {/* Chart & Low Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* 30-Day Sales Trend Chart (2 columns on lg) */}
            <div className="lg:col-span-2">
              <ChartCard
                title={t('farmer.sales_trend')}
                subtitle="Fulfilled orders aggregated over the last 30 days"
                data={stats?.salesByMonth || []}
                type="bar"
                dataKey="sales"
                emptyMessage="No sales recorded this month yet. Orders will appear here once fulfilled."
              />
            </div>

            {/* Right Column: Low Stock Alerts & Quick Actions */}
            <div className="space-y-6">
              {/* Low Stock Alerts */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    Low Stock Alerts
                  </h3>
                  {lowStockProducts.length > 0 && (
                    <Badge variant="amber" size="sm">
                      {lowStockProducts.length} items
                    </Badge>
                  )}
                </div>

                {lowStockProducts.length > 0 ? (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-neutral-900 truncate">{p.name}</p>
                          <p className="text-amber-800 font-medium">
                            Only {p.quantityAvailable} {p.unit?.toLowerCase()} left
                          </p>
                        </div>
                        <Link
                          to={`/farmer/products/edit/${p.id}`}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition"
                        >
                          Restock
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 py-3 text-center">
                    All listed crops have healthy inventory levels.
                  </p>
                )}
              </div>

              {/* Quick Action Shortcuts */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-neutral-200/80 space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/farmer/orders"
                    className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition text-left group"
                  >
                    <ClipboardList size={18} className="text-brand-700 mb-1.5" />
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-brand-800">
                      Orders
                    </p>
                    <p className="text-2xs text-neutral-500">View incoming</p>
                  </Link>

                  <Link
                    to="/farmer/mandi"
                    className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition text-left group"
                  >
                    <Tractor size={18} className="text-brand-700 mb-1.5" />
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-brand-800">
                      Mandi Rates
                    </p>
                    <p className="text-2xs text-neutral-500">Benchmark prices</p>
                  </Link>

                  <Link
                    to="/farmer/earnings"
                    className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition text-left group"
                  >
                    <DollarSign size={18} className="text-brand-700 mb-1.5" />
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-brand-800">
                      Earnings
                    </p>
                    <p className="text-2xs text-neutral-500">Payout reports</p>
                  </Link>

                  <Link
                    to="/farmer/reviews"
                    className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition text-left group"
                  >
                    <Star size={18} className="text-brand-700 mb-1.5" />
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-brand-800">
                      Reviews
                    </p>
                    <p className="text-2xs text-neutral-500">Buyer feedback</p>
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
