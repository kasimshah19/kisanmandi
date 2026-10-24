import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  ArrowLeft,
  ImageOff,
  Loader2,
  Check,
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { reviewService } from '../../services/phase5Services';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import QuantityInput from '../../components/QuantityInput';
import { SkeletonLine } from '../../components/Skeleton';
import StarRating from '../../components/StarRating';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatINR, unitLabel } from '../../utils/format';
import { getDetailImageUrl } from '../../utils/image';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Reviews state for the farmer
  const [reviewsData, setReviewsData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(0);

  useDocumentTitle(product ? `${product.name} | KisanMandi` : t('products.product_details'));

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setNotFound(false);
    setError(null);
    try {
      const res = await productService.getPublicProduct(id);
      const prod = res.data;
      setProduct(prod);

      // Set initial quantity based on unit
      const unit = prod.unit;
      setQuantity(unit === 'DOZEN' || unit === 'PIECE' ? 1 : 0.5);

      // Load reviews if farmerId is present
      if (prod.farmerId) {
        loadFarmerReviews(prod.farmerId, 0);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry'));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFarmerReviews = async (farmerId, page = 0) => {
    setReviewsLoading(true);
    try {
      const res = await reviewService.getPublicReviews(farmerId, page, 5);
      setReviewsData(res || { content: [], totalPages: 0, totalElements: 0 });
      setReviewsPage(page);
    } catch {
      // Ignored non-critical failure for reviews block
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setAdding(true);
    try {
      const roundedQty = Math.round(quantity * 100) / 100;
      await cartService.add(product.id, roundedQty);
      toast.success(`${product.name} ${t('cart.item_count_one', { count: 1 })}`);
      setAdded(true);
      refreshCart();
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setAdding(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-8">
        <div className="page-container max-w-5xl space-y-6">
          <SkeletonLine className="h-4 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="aspect-[4/3] bg-neutral-200/80 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <SkeletonLine className="h-6 w-28 rounded-full" />
              <SkeletonLine className="h-10 w-3/4 rounded-xl" />
              <SkeletonLine className="h-8 w-1/3 rounded-xl" />
              <SkeletonLine className="h-20 w-full rounded-2xl" />
              <SkeletonLine className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#fafaf7] py-12">
        <div className="page-container max-w-md">
          <ErrorState message={error} onRetry={loadProduct} />
        </div>
      </div>
    );
  }

  // 404 Not found
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center py-20">
        <div className="page-container max-w-md text-center bg-white p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold text-xl">
            ?
          </div>
          <h2 className="text-xl font-bold text-neutral-900">{t('common.not_found_title')}</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">{t('common.not_found_desc')}</p>
          <Button variant="primary" as={Link} to="/products" className="w-full">
            {t('nav.browse')}
          </Button>
        </div>
      </div>
    );
  }

  const price = Number(product.pricePerUnit);
  const stock = Number(product.quantityAvailable);
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= 5;
  const isFarmerOrAdmin = user?.role === 'FARMER' || user?.role === 'ADMIN';

  const farmerInitial = (product.farmName || product.farmerName || 'F')[0].toUpperCase();
  const farmerRatingAvg = Number(product.farmerRating || product.farmerRatingAvg || 0);
  const farmerRatingCount = Number(product.reviewCount || product.farmerRatingCount || 0);

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10 pb-28 sm:pb-12">
      <div className="page-container max-w-5xl">
        {/* Breadcrumb Header */}
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.browse'), to: '/products' },
            ...(product.categoryName ? [{ label: product.categoryName, to: `/products?categoryId=${product.categoryId}` }] : []),
            { label: product.name }
          ]}
          title=""
          className="mb-4"
        />

        {/* Main 2-Column Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Left Column: 4:3 Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-white rounded-3xl overflow-hidden border border-neutral-200/90 relative shadow-sm flex items-center justify-center group">
              {product.imageUrl ? (
                <img
                  src={getDetailImageUrl(product.imageUrl)}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Graceful Fallback Placeholder */}
              <div
                className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-brand-50/30 text-neutral-400 p-6 ${
                  product.imageUrl ? 'hidden' : 'flex'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/80 border border-neutral-200/80 flex items-center justify-center text-brand-600/70 mb-2 shadow-xs">
                  <ImageOff size={28} />
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {t('products.produce_from_farm', { farm: product.farmName || product.farmerName || 'KisanMandi' })}
                </span>
              </div>

              {/* Badges / Ribbons */}
              {isOutOfStock ? (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                  {t('products.out_of_stock')}
                </div>
              ) : isLowStock ? (
                <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <Clock size={13} />
                  {t('products.low_stock_hint', { count: stock, unit: unitLabel(product.unit, t) })}
                </div>
              ) : null}

              {product.isOrganic && (
                <div className="absolute bottom-4 left-4 bg-brand-700/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles size={12} className="text-brand-300" />
                  {t('products.organic')}
                </div>
              )}
            </div>

            {/* Quick Farm Verification Highlight */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-900">{t('products.verified')}</p>
                <p className="text-neutral-500">
                  {product.village ? `${product.village}, ` : ''}{product.district || 'Maharashtra'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Desktop Buy Box */}
          <div className="space-y-6">
            <div>
              {/* Category chip */}
              {product.categoryName && (
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-800 bg-brand-50 border border-brand-200/80 px-2.5 py-1 rounded-full mb-2">
                  {product.categoryName}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {product.name}
              </h1>

              {/* Rating link to scroll to reviews */}
              <div className="flex items-center gap-2 mt-2">
                {farmerRatingCount > 0 ? (
                  <a
                    href="#reviews"
                    className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-brand-700 transition group"
                  >
                    <StarRating value={farmerRatingAvg} size={15} />
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {farmerRatingAvg.toFixed(1)}
                    </span>
                    <span className="text-neutral-500 group-hover:underline">
                      ({t('reviews.based_on_reviews', { count: farmerRatingCount })})
                    </span>
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md">
                    ★ {t('products.new_rating')}
                  </span>
                )}
              </div>
            </div>

            {/* Price Large */}
            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex items-baseline justify-between">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-brand-800 tracking-tight">
                  {formatINR(price)}
                </span>
                <span className="text-sm font-semibold text-neutral-500 ml-1.5">
                  / {unitLabel(product.unit, t)}
                </span>
              </div>
              <div>
                {isOutOfStock ? (
                  <Badge variant="error" size="md">
                    {t('products.out_of_stock')}
                  </Badge>
                ) : isLowStock ? (
                  <Badge variant="warning" size="md">
                    {t('products.low_stock_hint', { count: stock, unit: unitLabel(product.unit, t) })}
                  </Badge>
                ) : (
                  <Badge variant="brand" size="md">
                    {t('products.in_stock')}: {stock} {unitLabel(product.unit, t)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Short Description */}
            {product.description && (
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1">
                  <Info size={13} className="text-brand-600" />
                  {t('products.description')}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Farmer Card */}
            <div className="bg-gradient-to-br from-white to-brand-50/30 rounded-2xl border border-brand-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {farmerInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    {t('products.farmer_by', { name: product.farmerName || product.farmName })}
                  </p>
                  <h3 className="font-bold text-neutral-900 text-base truncate">
                    {product.farmName || product.farmerName}
                  </h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-brand-600 shrink-0" />
                    <span className="truncate">
                      {product.village ? `${product.village}, ` : ''}{product.district || 'Maharashtra'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-100 flex items-center justify-between">
                <div className="text-xs text-neutral-600">
                  {farmerRatingCount > 0 ? (
                    <span className="font-medium">
                      ★ {farmerRatingAvg.toFixed(1)} ({farmerRatingCount} reviews)
                    </span>
                  ) : (
                    <span className="text-neutral-500">{t('reviews.no_reviews_yet')}</span>
                  )}
                </div>
                <Link
                  to={`/farmers/${product.farmerId}`}
                  className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center gap-0.5 group"
                >
                  {t('products.view_farm_reviews')}
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>

            {/* Desktop Buy Box (Hidden on Mobile) */}
            <div className="hidden sm:block bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-sm space-y-4">
              {isFarmerOrAdmin ? (
                <div className="p-3.5 bg-amber-50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200">
                  {t('auth.role_farmer_desc')} — Only customer accounts can add items to cart.
                </div>
              ) : (
                <div className="space-y-4">
                  {!isOutOfStock && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        {t('products.quantity')} ({unitLabel(product.unit, t)})
                      </label>
                      <QuantityInput
                        value={quantity}
                        unit={product.unit}
                        maxStock={stock}
                        onChange={setQuantity}
                      />
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isOutOfStock || adding}
                    loading={adding}
                    onClick={handleAddToCart}
                  >
                    {added ? (
                      <>
                        <Check size={18} className="mr-2" />
                        {t('common.continue')}!
                      </>
                    ) : isOutOfStock ? (
                      t('products.out_of_stock')
                    ) : (
                      <>
                        <ShoppingCart size={18} className="mr-2" />
                        {t('products.add_to_cart')} • {formatINR(price * quantity)}
                      </>
                    )}
                  </Button>

                  {added && (
                    <Link
                      to="/customer/cart"
                      className="block text-center text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
                    >
                      {t('nav.cart')} →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sections Below the Fold: Description, Farmer Info, Reviews */}
        <div className="mt-12 space-y-10 pt-8 border-t border-neutral-200/80">
          {/* About the Farmer & Farm Details */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                {t('products.about_farmer')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70">
                <p className="text-xs text-neutral-500 font-medium mb-1">{t('auth.farm_name_label')}</p>
                <p className="font-bold text-neutral-900">{product.farmName || product.farmerName || '—'}</p>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70">
                <p className="text-xs text-neutral-500 font-medium mb-1">{t('auth.district_label')}</p>
                <p className="font-bold text-neutral-900">{product.district || '—'}</p>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70">
                <p className="text-xs text-neutral-500 font-medium mb-1">{t('auth.address_label')}</p>
                <p className="font-bold text-neutral-900">{product.village || '—'}</p>
              </div>
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section id="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                  {t('products.reviews_and_ratings')}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t('reviews.based_on_reviews', { count: farmerRatingCount })}
                </p>
              </div>
            </div>

            {/* Rating Summary Card */}
            <RatingSummary
              average={farmerRatingAvg}
              count={farmerRatingCount}
              distribution={{}}
            />

            {/* Review List */}
            {reviewsLoading ? (
              <div className="space-y-3">
                <SkeletonLine className="h-24 w-full rounded-2xl" />
                <SkeletonLine className="h-24 w-full rounded-2xl" />
              </div>
            ) : (
              <ReviewList
                reviews={reviewsData.content || []}
                page={reviewsPage}
                totalPages={reviewsData.totalPages || 0}
                setPage={(p) => loadFarmerReviews(product.farmerId, p)}
              />
            )}
          </section>
        </div>
      </div>

      {/* Mobile Fixed Buy Box (Bottom Bar) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 p-3 shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        {isFarmerOrAdmin ? (
          <p className="text-center text-xs text-neutral-600 font-medium">
            Logged in as {user?.role}.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <span className="text-lg font-black text-brand-800">
                {formatINR(price * quantity)}
              </span>
              <span className="block text-[11px] text-neutral-500">
                {quantity} {unitLabel(product.unit, t)}
              </span>
            </div>

            {!isOutOfStock && (
              <div className="w-28 shrink-0">
                <QuantityInput
                  value={quantity}
                  unit={product.unit}
                  maxStock={stock}
                  onChange={setQuantity}
                />
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="flex-1 text-xs"
              disabled={isOutOfStock || adding}
              loading={adding}
              onClick={handleAddToCart}
            >
              {added ? (
                <Check size={16} />
              ) : isOutOfStock ? (
                t('products.out_of_stock')
              ) : (
                <>
                  <ShoppingCart size={15} className="mr-1" />
                  {t('products.add_to_cart')}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
