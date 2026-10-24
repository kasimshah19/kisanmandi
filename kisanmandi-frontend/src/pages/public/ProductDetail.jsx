import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  ArrowLeft,
  ImageOff,
  Check,
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { reviewService } from '../../services/phase5Services';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NumberStepper from '../../components/ui/NumberStepper';
import ListenButton from '../../components/ListenButton';
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
  const { t, i18n } = useTranslation();
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
  const [showAddedModal, setShowAddedModal] = useState(false);

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

      // Set initial quantity and step based on unit
      const unit = prod.unit;
      const initialQty = unit === 'DOZEN' || unit === 'PIECE' ? 1 : 1;
      setQuantity(initialQty);

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
      const roundedQty = Math.round(Number(quantity) * 100) / 100;
      await cartService.add(product.id, roundedQty);
      refreshCart();
      setShowAddedModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setAdding(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 py-8">
        <div className="page-container max-w-5xl space-y-6">
          <SkeletonLine className="h-4 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="aspect-[4/3] bg-stone-200/80 rounded-3xl animate-pulse" />
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
      <div className="min-h-screen bg-warm-50 py-12">
        <div className="page-container max-w-md">
          <ErrorState message={error} onRetry={loadProduct} />
        </div>
      </div>
    );
  }

  // 404 Not found
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-black text-2xl">
            ?
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900">{t('common.not_found_title', 'Produce Not Found')}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {t('common.not_found_desc', 'This harvest listing is no longer available or was removed.')}
          </p>
          <Button variant="primary" size="lg" as={Link} to="/products" className="w-full font-bold min-h-[50px]">
            {t('nav.browse', 'Browse other produce')}
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
  const unitText = unitLabel(product.unit, t);

  // Natural speech text for ListenButton
  const listenSentence =
    i18n.language === 'mr'
      ? `${product.name}, दर ${Math.round(price)} रुपये प्रति ${unitText}. थेट ${product.farmName || product.farmerName || 'शेतकरी'}, ${product.village || product.district || 'महाराष्ट्र'}.`
      : i18n.language === 'hi'
      ? `${product.name}, भाव ${Math.round(price)} रुपये प्रति ${unitText}. सीधे ${product.farmName || product.farmerName || 'किसान'}, ${product.village || product.district || 'महाराष्ट्र'}.`
      : `${product.name}. Price is ${Math.round(price)} rupees per ${unitText}. Directly from ${product.farmName || product.farmerName || 'farmer'}, ${product.village || product.district || 'Maharashtra'}.`;

  const stepperStep = product.unit === 'DOZEN' || product.unit === 'PIECE' ? 1 : 1;
  const stepperMin = 1;

  return (
    <div className="min-h-screen bg-warm-50 py-6 sm:py-8 lg:py-10 pb-36 sm:pb-12">
      <div className="page-container max-w-5xl">
        {/* Breadcrumb Header */}
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home', 'Home'), to: '/' },
            { label: t('nav.browse', 'Produce'), to: '/products' },
            ...(product.categoryName ? [{ label: product.categoryName, to: `/products?categoryId=${product.categoryId}` }] : []),
            { label: product.name }
          ]}
          title=""
          className="mb-4"
        />

        {/* Main 2-Column Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Left Column: Big 4:3 Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-white rounded-3xl overflow-hidden border-2 border-stone-200/90 relative shadow-sm flex items-center justify-center group">
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
                className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-green-50/40 text-stone-400 p-6 ${
                  product.imageUrl ? 'hidden' : 'flex'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-green-700 mb-2 shadow-xs">
                  <ImageOff size={28} />
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  {t('products.produce_from_farm', { farm: product.farmName || product.farmerName || 'KisanMandi' })}
                </span>
              </div>

              {/* Badges / Ribbons */}
              {isOutOfStock ? (
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                  {t('products.out_of_stock', 'Not available')}
                </div>
              ) : isLowStock ? (
                <div className="absolute top-4 left-4 bg-amber-400 text-stone-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <Clock size={14} className="text-stone-950" />
                  {t('products.low_stock_hint', { count: stock, unit: unitText })}
                </div>
              ) : null}

              {product.isOrganic && (
                <div className="absolute bottom-4 left-4 bg-green-800/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-300" />
                  {t('products.organic', 'Organic')}
                </div>
              )}
            </div>

            {/* Quick Farm Verification Highlight */}
            <div className="bg-white p-4 rounded-2xl border-2 border-stone-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-900">{t('products.verified', 'Verified Farm Harvest')}</p>
                <p className="text-stone-600">
                  {product.village ? `${product.village}, ` : ''}{product.district || 'Maharashtra'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Name, ListenButton, Price, Farmer Card & Desktop Buy Box */}
          <div className="space-y-6">
            <div>
              {/* Category chip & ListenButton in header row */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                {product.categoryName ? (
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-green-900 bg-green-100 border border-green-200 px-3 py-1 rounded-full">
                    {product.categoryName}
                  </span>
                ) : <span />}

                {/* Natural Speech ListenButton */}
                <ListenButton
                  textToSpeak={listenSentence}
                  size="md"
                  label={t('common.listen', 'Listen')}
                />
              </div>

              {/* Product Name */}
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating link to scroll to reviews */}
              <div className="flex items-center gap-2 mt-2">
                {farmerRatingCount > 0 ? (
                  <a
                    href="#reviews"
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-green-700 transition group"
                  >
                    <StarRating value={farmerRatingAvg} size={15} />
                    <span className="font-bold text-stone-900 tabular-nums">
                      {farmerRatingAvg.toFixed(1)}
                    </span>
                    <span className="text-stone-500 group-hover:underline">
                      ({t('reviews.based_on_reviews', { count: farmerRatingCount })})
                    </span>
                  </a>
                ) : (
                  <span className="text-xs font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-md">
                    ★ {t('products.new_rating', 'New')}
                  </span>
                )}
              </div>
            </div>

            {/* Price Large + Plain Language Stock */}
            <div className="p-5 bg-white rounded-3xl border-2 border-stone-200/90 shadow-2xs flex items-baseline justify-between gap-4">
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-green-800 tracking-tight">
                  {formatINR(price)}
                </span>
                <span className="text-base font-semibold text-stone-600 ml-1.5">
                  / {unitText}
                </span>
              </div>
              <div>
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {t('products.out_of_stock', 'Not available')}
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {t('products.low_stock_hint', { count: stock, unit: unitText })}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-900 border border-green-200">
                    {t('products.in_stock', 'In stock')}: {stock} {unitText}
                  </span>
                )}
              </div>
            </div>

            {/* Farmer Trust Card */}
            <div className="bg-gradient-to-br from-white to-green-50/30 rounded-3xl border-2 border-stone-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-green-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
                  {farmerInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-green-800">
                    {t('products.farmer_by', { name: product.farmerName || product.farmName })}
                  </p>
                  <h3 className="font-extrabold text-stone-900 text-base sm:text-lg truncate">
                    {product.farmName || product.farmerName}
                  </h3>
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-green-700 shrink-0" />
                    <span className="truncate">
                      {product.village ? `${product.village}, ` : ''}{product.district || 'Maharashtra'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <div className="text-xs text-stone-600">
                  {farmerRatingCount > 0 ? (
                    <span className="font-bold text-stone-900">
                      ★ {farmerRatingAvg.toFixed(1)} ({farmerRatingCount} reviews)
                    </span>
                  ) : (
                    <span className="text-stone-500">{t('reviews.no_reviews_yet', 'No reviews yet')}</span>
                  )}
                </div>
                <Link
                  to={`/farmers/${product.farmerId}`}
                  className="text-xs font-bold text-green-800 hover:text-green-950 flex items-center gap-1 group py-1"
                >
                  <span>{t('products.view_farm_reviews', 'View farm')}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>

            {/* Desktop Buy Box (Hidden on Mobile) */}
            <div className="hidden sm:block bg-white p-6 rounded-3xl border-2 border-stone-200/90 shadow-sm space-y-4">
              {isFarmerOrAdmin ? (
                <div className="p-4 bg-amber-50 text-amber-950 text-xs font-semibold rounded-2xl border border-amber-200">
                  {t('auth.role_farmer_desc')} — Only customer accounts can add produce to cart.
                </div>
              ) : (
                <div className="space-y-4">
                  {!isOutOfStock && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                        {t('products.quantity', 'Quantity')} ({unitText})
                      </label>
                      <NumberStepper
                        value={quantity}
                        onChange={setQuantity}
                        min={stepperMin}
                        max={stock}
                        step={stepperStep}
                        unit={unitText}
                        className="w-full"
                      />
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full min-h-[56px] text-base font-extrabold shadow-card"
                    disabled={isOutOfStock || adding}
                    loading={adding}
                    onClick={handleAddToCart}
                  >
                    {isOutOfStock ? (
                      t('products.out_of_stock', 'Not available')
                    ) : (
                      <>
                        <ShoppingCart size={20} className="mr-2" />
                        <span>{t('products.add_to_cart', 'Add to cart')}</span>
                        <span className="mx-1">•</span>
                        <span>{formatINR(price * quantity)}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sections Below the Fold: Description, Farmer Info, Reviews */}
        <div className="mt-12 space-y-10 pt-8 border-t border-stone-200">
          {/* About the Farmer & Farm Details */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-800 flex items-center justify-center shadow-2xs">
                <MapPin size={18} />
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                {t('products.about_farmer', 'About the Farmer & Location')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">{t('auth.farm_name_label', 'Farm Name')}</p>
                <p className="font-extrabold text-stone-900">{product.farmName || product.farmerName || '—'}</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">{t('auth.district_label', 'District')}</p>
                <p className="font-extrabold text-stone-900">{product.district || '—'}</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">{t('auth.address_label', 'Village / Area')}</p>
                <p className="font-extrabold text-stone-900">{product.village || '—'}</p>
              </div>
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section id="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                  <Star size={22} className="text-amber-500 fill-amber-500" />
                  <span>{t('products.reviews_and_ratings', 'Customer Reviews')}</span>
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
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

      {/* MOBILE FIXED BUY BOX (Bottom Bar with Safe Area) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-stone-200 p-3 shadow-pop pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        {isFarmerOrAdmin ? (
          <p className="text-center text-xs text-stone-700 font-semibold py-2">
            Logged in as {user?.role}. Only customers can order.
          </p>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="shrink-0">
              <span className="text-lg font-extrabold text-green-900 block leading-tight">
                {formatINR(price * quantity)}
              </span>
              <span className="text-xs font-semibold text-stone-600">
                {quantity} {unitText}
              </span>
            </div>

            {!isOutOfStock && (
              <div className="w-32 shrink-0">
                <NumberStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={stepperMin}
                  max={stock}
                  step={stepperStep}
                  unit={unitText}
                />
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="flex-1 min-h-[52px] text-xs font-bold shadow-xs"
              disabled={isOutOfStock || adding}
              loading={adding}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? (
                t('products.out_of_stock', 'Not available')
              ) : (
                <>
                  <ShoppingCart size={16} className="mr-1" />
                  <span>{t('products.add_to_cart', 'Add')}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* FRIENDLY ADDED CONFIRMATION MODAL ("Go to cart" / "Keep shopping") */}
      {showAddedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-pop border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center mx-auto shadow-xs">
              <Check size={32} className="stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                {t('cart.item_added_title', 'Added to your cart!')}
              </h3>
              <p className="text-sm text-stone-600 font-medium">
                {quantity} {unitText} of <span className="font-bold text-stone-900">{product.name}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                as={Link}
                to="/customer/cart"
                variant="primary"
                size="lg"
                className="w-full font-bold min-h-[50px] shadow-xs"
              >
                <span>{t('cart.go_to_cart', 'Go to cart')}</span>
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowAddedModal(false)}
                className="w-full font-semibold min-h-[46px]"
              >
                {t('cart.keep_shopping', 'Keep shopping')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
