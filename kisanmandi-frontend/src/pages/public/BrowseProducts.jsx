import { useState, useEffect, useRef } from 'react';
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
  Layers,
  ArrowRight
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
import Card from '../../components/ui/Card';
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
    categoryService.getCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    loadProducts();
  }, [categoryId, q, district, pincode, sort, latitude, longitude, radius, page]);

  // Fetch nearby farmers when location is active
  useEffect(() => {
    if (latitude && longitude) {
      nearbyService.getNearbyFarmers({ latitude, longitude, radius })
        .then(res => setNearbyFarmers(res || []))
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

  const activeFiltersCount = [
    categoryId,
    district,
    pincode,
    sort,
    latitude
  ].filter(Boolean).length;

  const hasAnyFilter = activeFiltersCount > 0 || !!q;

  // Body scroll lock for mobile filter sheet
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

  const selectedCategoryObj = categories.find(c => String(c.id) === String(categoryId));

  const renderFilterControls = (isMobile = false) => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Layers size={13} className="text-brand-600" />
            {t('farmer.category_select')}
          </label>
          {categoryId && (
            <button
              onClick={() => updateParam('categoryId', '')}
              className="text-xs text-brand-700 hover:text-brand-800 font-medium"
            >
              {t('common.clear')}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => updateParam('categoryId', '')}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition text-left ${
              !categoryId
                ? 'bg-brand-50 text-brand-800 font-semibold ring-1 ring-brand-200'
                : 'text-neutral-700 hover:bg-neutral-100/70'
            }`}
          >
            <span>{t('products.category_all')}</span>
            {!categoryId && <Check size={15} className="text-brand-600" />}
          </button>
          {categories.filter(c => c.active !== false).map(cat => {
            const isSelected = String(categoryId) === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('categoryId', String(cat.id))}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition text-left ${
                  isSelected
                    ? 'bg-brand-50 text-brand-800 font-semibold ring-1 ring-brand-200'
                    : 'text-neutral-700 hover:bg-neutral-100/70'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <Check size={15} className="text-brand-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Near Me Card */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
            <MapPin size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              {t('products.near_me_title')}
            </h4>
            <p className="text-xs text-neutral-600 leading-snug">
              {t('products.near_me_desc')}
            </p>
          </div>
        </div>

        {/* 4 States */}
        {!latitude ? (
          locatingState === 'asking' ? (
            <div className="p-2.5 rounded-xl bg-white border border-brand-200 text-xs text-brand-800 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
              <span>{t('products.location_permission_asking')}</span>
            </div>
          ) : locatingState === 'denied' ? (
            <div className="space-y-2">
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                {t('products.location_denied_help')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleUseLocation}
              >
                <Navigation size={13} className="mr-1.5" />
                {t('common.retry')}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={handleUseLocation}
            >
              <Navigation size={13} className="mr-1.5 text-brand-700" />
              {t('products.use_current_location')}
            </Button>
          )
        ) : (
          <div className="space-y-2 pt-1 border-t border-brand-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-700">{t('products.within_radius')}</span>
              <select
                value={radius}
                onChange={(e) => updateParam('radius', e.target.value)}
                className="bg-white border border-brand-200 rounded-lg text-xs font-semibold text-brand-800 px-2 py-1 outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>
            <button
              onClick={() => handleLocationChange(null)}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X size={12} />
              {t('products.turn_off')}
            </button>
          </div>
        )}
      </div>

      {/* District & Pincode */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            {t('auth.district_label')}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => updateParam('district', e.target.value)}
            placeholder="e.g. Pune, Nashik"
            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            {t('products.filter_by_pincode')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => updateParam('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit pincode"
            className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
          {t('products.sort_by')}
        </label>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
        >
          <option value="">{t('products.sort_newest')}</option>
          <option value="priceAsc">{t('products.sort_price_low_high')}</option>
          <option value="priceDesc">{t('products.sort_price_high_low')}</option>
          {latitude && longitude && (
            <option value="distanceAsc">{t('products.sort_distance')}</option>
          )}
        </select>
      </div>

      {/* Clear Filters button */}
      {hasAnyFilter && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 transition flex items-center justify-center gap-1.5 border border-dashed border-neutral-300 rounded-xl hover:border-red-300"
        >
          <RotateCcw size={13} />
          {t('products.clear_filters')}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container">
        {/* Page Header */}
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.browse') }
          ]}
          title={t('products.browse_title')}
          subtitle={t('products.browse_subtitle')}
        />

        {/* Search Bar + Mobile Filter Button */}
        <div className="mt-4 mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={19} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('products.search_placeholder')}
              className="w-full pl-11 pr-10 py-3 bg-white border border-neutral-200 rounded-2xl shadow-sm text-sm sm:text-base focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label={t('common.clear')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            aria-label={t('products.filter_sheet_title')}
            className={`lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl border font-semibold text-sm transition shadow-sm min-h-[46px] ${
              activeFiltersCount > 0
                ? 'bg-brand-50 border-brand-300 text-brand-800'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <SlidersHorizontal size={17} />
            <span className="hidden sm:inline">{t('common.filter')}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-700 text-white text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Layout Grid: Sidebar (Desktop) + Products (Right) */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block sticky top-24">
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                <span className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-brand-700" />
                  {t('products.filter_sheet_title')}
                </span>
                {activeFiltersCount > 0 && (
                  <Badge variant="brand" size="sm">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              {renderFilterControls(false)}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="space-y-5">
            {/* Active Filter Chips & Results Count */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">
                  {t('products.results_summary', {
                    shown: products.length,
                    total: totalElements
                  })}
                </span>

                {/* Filter Chips */}
                {selectedCategoryObj && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-800 border border-brand-200">
                    {selectedCategoryObj.name}
                    <button
                      onClick={() => updateParam('categoryId', '')}
                      className="hover:text-brand-950 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {district && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {district}
                    <button
                      onClick={() => updateParam('district', '')}
                      className="hover:text-neutral-950 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {pincode && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                    PIN: {pincode}
                    <button
                      onClick={() => updateParam('pincode', '')}
                      className="hover:text-neutral-950 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {latitude && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-800 border border-brand-200">
                    {t('products.near_me')} ({radius} km)
                    <button
                      onClick={() => handleLocationChange(null)}
                      className="hover:text-brand-950 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {hasAnyFilter && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 ml-1"
                  >
                    {t('products.clear_filters')}
                  </button>
                )}
              </div>

              {/* Sort quick dropdown for desktop / mobile */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
                  {t('products.sort_by')}:
                </span>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700 outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">{t('products.sort_newest')}</option>
                  <option value="priceAsc">{t('products.sort_price_low_high')}</option>
                  <option value="priceDesc">{t('products.sort_price_high_low')}</option>
                  {latitude && longitude && (
                    <option value="distanceAsc">{t('products.sort_distance')}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Nearby Farmers Row (When location is active and farmers exist) */}
            {latitude && nearbyFarmers.length > 0 && (
              <div className="bg-white rounded-2xl border border-brand-200/80 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-600" />
                    {t('products.nearby_farmers_heading')}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {nearbyFarmers.length} nearby
                  </span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {nearbyFarmers.map((f) => (
                    <Link
                      key={f.id || f.farmerId}
                      to={`/farmers/${f.id || f.farmerId}`}
                      className="snap-start shrink-0 w-56 p-3 rounded-xl border border-neutral-200 hover:border-brand-300 hover:shadow-md transition bg-gradient-to-b from-white to-brand-50/20 group"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition">
                          {(f.farmName || f.fullName || 'F')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-neutral-900 truncate">
                            {f.farmName || f.fullName}
                          </h4>
                          <p className="text-xs text-neutral-500 truncate">
                            {f.village ? `${f.village}, ${f.district || ''}` : f.district}
                          </p>
                        </div>
                      </div>
                      {f.distanceKm !== undefined && (
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
                          <span className="text-brand-700 font-medium">
                            {f.distanceKm.toFixed(1)} km away
                          </span>
                          <span className="text-neutral-400 group-hover:text-brand-700 flex items-center">
                            <ChevronRight size={14} />
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
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
                title={t('products.no_products_found')}
                message={t('products.no_products_desc')}
                action={
                  hasAnyFilter ? (
                    <Button onClick={clearFilters} variant="primary">
                      {t('products.clear_filters')}
                    </Button>
                  ) : null
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div className="pt-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParam('page', String(p))}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet via Portal */}
      {isFilterSheetOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <div
              className="bg-white w-full max-h-[85vh] sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header */}
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-brand-700" />
                  <h3 className="font-bold text-neutral-900 text-base">
                    {t('products.filter_sheet_title')}
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="brand" size="sm">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="px-5 py-4 overflow-y-auto flex-1">
                {renderFilterControls(true)}
              </div>

              {/* Sheet Footer */}
              <div className="px-5 py-3.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={clearFilters}
                  disabled={!hasAnyFilter}
                >
                  {t('products.clear_filters')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  {t('products.apply_filters')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
