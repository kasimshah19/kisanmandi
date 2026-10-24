import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Navigation,
  Check,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Calendar,
  Layers
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { nearbyService } from '../../services/phase5Services';
import { getCurrentPosition } from '../../utils/geo';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import NoResults from '../../components/illustrations/NoResults';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import VoiceSearchButton from '../../components/VoiceSearchButton';
import { getCategoryIcon } from '../../utils/categoryIcons';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const PAGE_SIZE = 12;

export default function BrowseProducts() {
  const { t } = useTranslation();
  useDocumentTitle('Browse Fresh Produce | KisanMandi');

  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [locatingState, setLocatingState] = useState('idle'); // 'idle' | 'asking' | 'denied'
  const [nearbyFarmers, setNearbyFarmers] = useState([]);

  // URL Query Params
  const categoryId = searchParams.get('categoryId') || '';
  const q = searchParams.get('q') || '';
  const district = searchParams.get('district') || '';
  const pincode = searchParams.get('pincode') || '';
  const sort = searchParams.get('sort') || '';
  const latitude = searchParams.get('latitude') || '';
  const longitude = searchParams.get('longitude') || '';
  const radius = searchParams.get('radius') || '25';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Search input state
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== q) {
      updateParam('q', debouncedSearch);
    }
  }, [debouncedSearch]);

  // Keep searchInput in sync when q changes externally
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Load categories
  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    loadProducts();
  }, [categoryId, q, district, pincode, sort, latitude, longitude, radius, page]);

  // Fetch nearby farmers when location is active
  useEffect(() => {
    if (latitude && longitude) {
      nearbyService
        .getNearbyFarmers({ latitude, longitude, radius })
        .then((res) => setNearbyFarmers(res || []))
        .catch(() => setNearbyFarmers([]));
    } else {
      setNearbyFarmers([]);
    }
  }, [latitude, longitude, radius]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getPublicProducts({
        categoryId: categoryId || undefined,
        q: q || undefined,
        district: district || undefined,
        pincode: pincode || undefined,
        sort: sort || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        radius: latitude ? radius : undefined,
        page,
        size: PAGE_SIZE,
      });
      const items = res.data.content || [];
      setProducts(items);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements ?? items.length);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '0');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
    setLocatingState('idle');
  };

  const handleUseLocation = async () => {
    setLocatingState('asking');
    try {
      const pos = await getCurrentPosition();
      handleLocationChange(pos);
      setLocatingState('idle');
      toast.success(t('products.location_detected'));
    } catch (err) {
      setLocatingState('denied');
      toast.error(err.message || t('products.location_denied'));
    }
  };

  const handleLocationChange = (pos) => {
    const params = new URLSearchParams(searchParams);
    if (pos) {
      params.set('latitude', pos.lat);
      params.set('longitude', pos.lng);
      params.set('radius', radius);
      if (!params.get('sort')) params.set('sort', 'distanceAsc');
    } else {
      params.delete('latitude');
      params.delete('longitude');
      params.delete('radius');
      if (params.get('sort') === 'distanceAsc') params.delete('sort');
    }
    params.set('page', '0');
    setSearchParams(params);
  };

  const activeFiltersCount = [categoryId, district, pincode, sort, latitude].filter(Boolean).length;
  const hasAnyFilter = activeFiltersCount > 0 || !!q;

  // Body scroll lock for filter sheet
  useEffect(() => {
    if (isFilterSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterSheetOpen]);

  // Escape key closes filter sheet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFilterSheetOpen) {
        setIsFilterSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterSheetOpen]);

  const selectedCategoryObj = categories.find((c) => String(c.id) === String(categoryId));

  // Advanced Filter Controls inside BottomSheet / Drawer
  const renderAdvancedFilterControls = () => (
    <div className="space-y-6">
      {/* Category selection list */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5 mb-2.5">
          <Layers size={14} className="text-green-700" />
          <span>{t('farmer.category_select', 'Category')}</span>
        </label>
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateParam('categoryId', '')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
              !categoryId
                ? 'bg-green-100 text-green-900 border border-green-300'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>{t('products.category_all', 'All Categories')}</span>
            {!categoryId && <Check size={16} className="text-green-700 stroke-[2.5]" />}
          </button>
          {categories
            .filter((c) => c.active !== false)
            .map((cat) => {
              const isSelected = String(categoryId) === String(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => updateParam('categoryId', String(cat.id))}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-green-100 text-green-900 border border-green-300'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{getCategoryIcon(cat.name)}</span>
                    <span>{cat.name}</span>
                  </span>
                  {isSelected && <Check size={16} className="text-green-700 stroke-[2.5]" />}
                </button>
              );
            })}
        </div>
      </div>

      {/* Near Me & Radius Controls */}
      <div className="rounded-2xl border-2 border-green-100 bg-green-50/60 p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-950">
              {t('products.near_me_title', 'Distance Search')}
            </h4>
            <p className="text-xs text-stone-600 leading-snug">
              {t('products.near_me_desc', 'Find farmers close to your kitchen')}
            </p>
          </div>
        </div>

        {!latitude ? (
          locatingState === 'asking' ? (
            <div className="p-3 rounded-xl bg-white border border-green-200 text-xs text-green-800 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
              <span>{t('products.location_permission_asking', 'Asking for your location...')}</span>
            </div>
          ) : locatingState === 'denied' ? (
            <div className="space-y-2">
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {t('products.location_denied_help', 'Location permission was denied in your browser.')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs min-h-[44px]"
                onClick={handleUseLocation}
              >
                <Navigation size={14} className="mr-1.5" />
                {t('common.retry', 'Try again')}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs min-h-[44px] font-bold"
              onClick={handleUseLocation}
            >
              <Navigation size={14} className="mr-1.5 text-green-700" />
              {t('products.use_current_location', 'Use my current location')}
            </Button>
          )
        ) : (
          <div className="space-y-2 pt-2 border-t border-green-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">{t('products.within_radius', 'Within radius')}</span>
              <select
                value={radius}
                onChange={(e) => updateParam('radius', e.target.value)}
                className="bg-white border border-green-300 rounded-xl text-xs font-bold text-green-900 px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => handleLocationChange(null)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer pt-1"
            >
              <X size={13} />
              {t('products.turn_off', 'Turn off location')}
            </button>
          </div>
        )}
      </div>

      {/* District & Pincode Filter */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            {t('auth.district_label', 'District in Maharashtra')}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => updateParam('district', e.target.value)}
            placeholder="e.g. Pune, Nashik, Kolhapur"
            className="w-full px-3.5 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            {t('products.filter_by_pincode', '6-Digit Pin Code')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => updateParam('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="e.g. 411001"
            className="w-full px-3.5 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition font-medium"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-50 py-6 sm:py-8 lg:py-10 pb-20">
      <div className="page-container max-w-7xl">
        {/* Page Header */}
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home', 'Home'), to: '/' },
            { label: t('nav.browse', 'Produce') }
          ]}
          title={t('products.browse_title', 'Browse Fresh Produce')}
          subtitle={t('products.browse_subtitle', 'Directly listed by verified farmers across Maharashtra')}
        />

        {/* 1. TOP HUGE FRIENDLY SEARCH BAR (56px) WITH VOICE SEARCH */}
        <div className="mt-4 mb-4 flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={22} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('products.search_placeholder', 'Search vegetables, fruits, grains, or farmer names...')}
              className="w-full min-h-[56px] pl-12 pr-24 sm:pr-28 py-3.5 bg-white border-2 border-stone-200/90 rounded-2xl shadow-xs text-base sm:text-lg text-stone-900 placeholder:text-stone-400 focus:ring-3 focus:ring-green-600 focus:border-green-600 outline-none transition font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label={t('common.clear', 'Clear search')}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
              {/* Feature-detected VoiceSearchButton */}
              <VoiceSearchButton
                onResult={(text) => setSearchInput(text)}
                size="md"
              />
            </div>
          </div>

          {/* Filter button for mobile and desktop */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            aria-label={t('common.filter', 'Filter produce')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 min-h-[56px] rounded-2xl border-2 font-bold text-sm sm:text-base transition shadow-xs cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-green-100 border-green-600 text-green-950'
                : 'bg-white border-stone-200/90 text-stone-800 hover:bg-stone-50 active:bg-stone-100'
            }`}
          >
            <SlidersHorizontal size={19} className="text-green-700" />
            <span className="hidden sm:inline">{t('common.filter', 'Filters')}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-extrabold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* 2. HORIZONTALLY SCROLLABLE ROW OF CATEGORY TILES (snap scrolling, min 84px) */}
        <div className="mb-4 overflow-x-auto pb-2 scrollbar-hide snap-x flex items-center gap-2.5">
          {/* 'All' Category Tile */}
          <button
            type="button"
            onClick={() => updateParam('categoryId', '')}
            className={`snap-start shrink-0 min-w-[96px] sm:min-w-[110px] min-h-[84px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition cursor-pointer active:scale-95 ${
              !categoryId
                ? 'bg-green-700 border-green-800 text-white shadow-card'
                : 'bg-white border-stone-200 text-stone-800 hover:border-green-400 hover:bg-green-50/40 shadow-2xs'
            }`}
          >
            <span className="text-2xl mb-1">🌾</span>
            <span className="text-xs sm:text-sm font-bold truncate max-w-[90px]">
              {t('products.category_all', 'All')}
            </span>
          </button>

          {/* Category List */}
          {categories
            .filter((c) => c.active !== false)
            .map((cat) => {
              const isSelected = String(categoryId) === String(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => updateParam('categoryId', String(cat.id))}
                  className={`snap-start shrink-0 min-w-[96px] sm:min-w-[110px] min-h-[84px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-green-700 border-green-800 text-white shadow-card'
                      : 'bg-white border-stone-200 text-stone-800 hover:border-green-400 hover:bg-green-50/40 shadow-2xs'
                  }`}
                >
                  <span className="text-2xl mb-1">{getCategoryIcon(cat.name)}</span>
                  <span className="text-xs sm:text-sm font-bold truncate max-w-[95px]">
                    {cat.name}
                  </span>
                </button>
              );
            })}
        </div>

        {/* 3. THREE BIG QUICK BUTTONS IN ONE ROW */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          {/* Near Me Quick Button */}
          <button
            type="button"
            onClick={latitude ? () => handleLocationChange(null) : handleUseLocation}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 min-h-[50px] rounded-2xl border-2 font-bold text-xs sm:text-sm transition cursor-pointer text-center ${
              latitude
                ? 'bg-green-700 border-green-800 text-white shadow-xs'
                : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50 active:bg-stone-100 shadow-2xs'
            }`}
          >
            <Navigation size={16} className={latitude ? 'text-white' : 'text-green-700'} />
            <span className="truncate">
              {latitude ? `${radius} km` : t('products.near_me', 'Near me')}
            </span>
            {latitude && <X size={14} className="ml-1 text-white/80" />}
          </button>

          {/* Cheapest First Quick Button */}
          <button
            type="button"
            onClick={() => updateParam('sort', sort === 'priceAsc' ? '' : 'priceAsc')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 min-h-[50px] rounded-2xl border-2 font-bold text-xs sm:text-sm transition cursor-pointer text-center ${
              sort === 'priceAsc'
                ? 'bg-green-700 border-green-800 text-white shadow-xs'
                : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50 active:bg-stone-100 shadow-2xs'
            }`}
          >
            <ArrowUpDown size={16} className={sort === 'priceAsc' ? 'text-white' : 'text-green-700'} />
            <span className="truncate">{t('products.sort_cheapest', 'Cheapest')}</span>
          </button>

          {/* Newest Quick Button */}
          <button
            type="button"
            onClick={() => updateParam('sort', '')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 min-h-[50px] rounded-2xl border-2 font-bold text-xs sm:text-sm transition cursor-pointer text-center ${
              !sort
                ? 'bg-green-700 border-green-800 text-white shadow-xs'
                : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50 active:bg-stone-100 shadow-2xs'
            }`}
          >
            <Calendar size={16} className={!sort ? 'text-white' : 'text-green-700'} />
            <span className="truncate">{t('products.sort_newest', 'Newest')}</span>
          </button>
        </div>

        {/* 4. ACTIVE FILTER CHIPS WITH PLAIN WORDS */}
        {hasAnyFilter && (
          <div className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs font-bold text-stone-500 mr-1">
              {t('products.results_summary', {
                shown: products.length,
                total: totalElements,
              })}
            </span>

            {selectedCategoryObj && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
                <span>{selectedCategoryObj.name}</span>
                <button
                  type="button"
                  onClick={() => updateParam('categoryId', '')}
                  className="hover:text-green-950 p-0.5 cursor-pointer"
                  aria-label="Remove category filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {district && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                <span>{district}</span>
                <button
                  type="button"
                  onClick={() => updateParam('district', '')}
                  className="hover:text-stone-950 p-0.5 cursor-pointer"
                  aria-label="Remove district filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {pincode && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                <span>PIN: {pincode}</span>
                <button
                  type="button"
                  onClick={() => updateParam('pincode', '')}
                  className="hover:text-stone-950 p-0.5 cursor-pointer"
                  aria-label="Remove pincode filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {latitude && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
                <span>{t('products.near_me', 'Near me')} ({radius} km)</span>
                <button
                  type="button"
                  onClick={() => handleLocationChange(null)}
                  className="hover:text-green-950 p-0.5 cursor-pointer"
                  aria-label="Remove location filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {sort === 'priceAsc' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                <span>{t('products.sort_price_low_high', 'Cheapest first')}</span>
                <button
                  type="button"
                  onClick={() => updateParam('sort', '')}
                  className="hover:text-stone-950 p-0.5 cursor-pointer"
                  aria-label="Remove price sort"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold underline underline-offset-2 ml-auto cursor-pointer"
            >
              {t('products.clear_filters', 'Clear all')}
            </button>
          </div>
        )}

        {/* Nearby Farmers Section if coordinates are set */}
        {latitude && nearbyFarmers.length > 0 && (
          <div className="mb-8 bg-white rounded-3xl border-2 border-green-100 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span>{t('products.nearby_farmers_heading', 'Farmers near you')}</span>
              </h3>
              <span className="text-xs font-bold text-stone-500">
                {nearbyFarmers.length} found
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {nearbyFarmers.map((f) => (
                <Link
                  key={f.id || f.farmerId}
                  to={`/farmers/${f.id || f.farmerId}`}
                  className="snap-start shrink-0 w-60 p-3.5 rounded-2xl border-2 border-stone-200 hover:border-green-500 hover:shadow-card transition bg-gradient-to-b from-white to-green-50/20 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 font-extrabold text-base flex items-center justify-center shrink-0 group-hover:bg-green-700 group-hover:text-white transition shadow-2xs">
                      {(f.farmName || f.fullName || 'F')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {f.farmName || f.fullName}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">
                        {f.village ? `${f.village}, ${f.district || ''}` : f.district}
                      </p>
                    </div>
                  </div>
                  {f.distanceKm !== undefined && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <span className="text-green-800 font-bold">
                        {f.distanceKm.toFixed(1)} km away
                      </span>
                      <span className="text-stone-400 group-hover:text-green-700 flex items-center">
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 5. PRODUCT GRID (2 columns at 360px with large photos, 3-4 on desktop) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load produce items"
            message={error}
            onRetry={loadProducts}
          />
        ) : products.length === 0 ? (
          <EmptyState
            illustration={NoResults}
            title={t('products.no_products_found', 'No Produce Found')}
            message={t('products.no_products_desc', 'Try clearing your search or distance filters to see more harvests.')}
            action={
              hasAnyFilter ? (
                <Button onClick={clearFilters} variant="primary" size="lg" className="min-h-[50px] font-bold">
                  {t('products.clear_filters', 'Clear filters')}
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            <div className="pt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => updateParam('page', String(p))}
              />
            </div>
          </>
        )}
      </div>

      {/* FILTER BOTTOM SHEET VIA PORTAL */}
      {isFilterSheetOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <div
              className="bg-white w-full max-h-[85vh] sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-pop flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header */}
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal size={20} className="text-green-700" />
                  <h3 className="font-extrabold text-stone-900 text-lg">
                    {t('products.filter_sheet_title', 'Filter Produce')}
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="brand" size="sm">
                      {activeFiltersCount} active
                    </Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                  aria-label={t('common.close', 'Close')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="px-6 py-5 overflow-y-auto flex-1">
                {renderAdvancedFilterControls()}
              </div>

              {/* Sheet Footer */}
              <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={clearFilters}
                  disabled={!hasAnyFilter}
                  className="font-bold min-h-[46px]"
                >
                  {t('products.clear_filters', 'Clear all')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 font-bold min-h-[46px]"
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  {t('products.apply_filters', 'Show results')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
