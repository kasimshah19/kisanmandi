import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  Package,
  MessageSquare,
  Sparkles,
  Store
} from 'lucide-react';
import { publicFarmerService, reviewService } from '../../services/phase5Services';
import { productService } from '../../services/productService';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';
import ProductCard from '../../components/ProductCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import NoReviews from '../../components/illustrations/NoReviews';
import { formatDate } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function FarmerPublicProfile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [farmer, setFarmer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'reviews'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  const displayName = farmer?.farmName || farmer?.fullName || farmer?.name || 'Local Farmer';

  useDocumentTitle(farmer ? `${displayName} | KisanMandi` : `Farmer Profile | KisanMandi`);

  useEffect(() => {
    loadFarmer();
    loadFarmerProducts();
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [id, page]);

  const loadFarmer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicFarmerService.getFarmer(id);
      setFarmer(res);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadFarmerProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getPublicProducts({ farmerId: id, size: 24 });
      setFarmerProducts(res.data?.content || []);
    } catch {
      setFarmerProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await reviewService.getPublicReviews(id, page, 10);
      setReviews(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch {
      // Non-critical fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-8">
        <div className="page-container max-w-5xl space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-16">
        <div className="page-container max-w-md text-center space-y-4">
          <ErrorState
            title={t('common.not_found_title')}
            message={error || t('common.not_found_desc')}
            onRetry={loadFarmer}
          />
          <Button as={Link} to="/products" variant="outline" size="sm">
            &larr; {t('nav.browse')}
          </Button>
        </div>
      </div>
    );
  }

  const initial = (displayName || 'F')[0].toUpperCase();
  const ratingAvg = Number(farmer.rating || 0);
  const reviewCount = Number(farmer.reviewCount || 0);

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container max-w-5xl space-y-8">
        {/* Breadcrumb Header */}
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.browse'), to: '/products' },
            { label: displayName }
          ]}
          title=""
          className="mb-0"
        />

        {/* Profile Card with Cover Banner & Avatar */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-sm">
          {/* Gradient Cover Banner */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-200 text-xs font-semibold">
              <ShieldCheck size={14} className="text-brand-300" />
              <span>{t('products.verified')}</span>
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative">
            {/* Avatar Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-700 text-white border-4 border-white shadow-xl absolute -top-12 sm:-top-14 flex items-center justify-center text-3xl sm:text-4xl font-black">
              {initial}
            </div>

            <div className="pt-16 sm:pt-18 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                    {displayName}
                  </h1>
                  {farmer.farmName && farmer.fullName && (
                    <span className="text-xs font-semibold text-neutral-500">
                      ({farmer.fullName})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 font-medium">
                  {(farmer.village || farmer.district) && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-brand-600" />
                      {farmer.village ? `${farmer.village}, ` : ''}{farmer.district || ''}{farmer.state ? `, ${farmer.state}` : ''}
                    </span>
                  )}
                  {farmer.createdAt && (
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Calendar size={13} />
                      Member since {formatDate(farmer.createdAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating Pill */}
              <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-2xl border border-neutral-200/70 shrink-0">
                <div className="flex items-center gap-1.5 px-2">
                  <Star size={16} className="fill-amber-500 text-amber-500" />
                  <span className="text-base font-black text-neutral-900 tabular-nums">
                    {ratingAvg > 0 ? ratingAvg.toFixed(1) : t('products.new_rating')}
                  </span>
                </div>
                <div className="w-px h-6 bg-neutral-200" />
                <span className="text-xs text-neutral-500 font-semibold pr-2">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs: Products & Reviews */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-200/80 pb-3">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 pb-2 text-sm font-bold transition border-b-2 -mb-3.5 px-2 ${
                activeTab === 'products'
                  ? 'border-brand-700 text-brand-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Package size={16} />
              <span>Available Produce ({farmerProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 pb-2 text-sm font-bold transition border-b-2 -mb-3.5 px-2 ${
                activeTab === 'reviews'
                  ? 'border-brand-700 text-brand-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <MessageSquare size={16} />
              <span>{t('reviews.reviews_and_ratings')} ({reviewCount})</span>
            </button>
          </div>

          {/* Products Tab Content */}
          {activeTab === 'products' && (
            <div>
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : farmerProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200/90 p-8 space-y-2">
                  <Store size={32} className="mx-auto text-neutral-300" />
                  <h3 className="font-bold text-neutral-800 text-sm">No products listed right now</h3>
                  <p className="text-xs text-neutral-500">Check back after the upcoming harvest.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {farmerProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab Content */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviewCount > 0 ? (
                <RatingSummary
                  average={farmer.rating}
                  count={reviewCount}
                  distribution={farmer.ratingDistribution || {}}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200/90 space-y-2">
                  <p className="text-sm font-semibold text-neutral-700">
                    {t('reviews.no_ratings_yet')}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Be the first customer to purchase and share feedback!
                  </p>
                </div>
              )}

              <ReviewList
                reviews={reviews}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
