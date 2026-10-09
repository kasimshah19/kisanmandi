import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import useDebounce from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const PAGE_SIZE = 12;

export default function BrowseProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!(params.get('district') || params.get('pincode') || params.get('sort'));
  });

  // Read filters from URL
  const categoryId = searchParams.get('categoryId') || '';
  const q = searchParams.get('q') || '';
  const district = searchParams.get('district') || '';
  const pincode = searchParams.get('pincode') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Local search input (debounced)
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== q) {
      updateParam('q', debouncedSearch);
    }
  }, [debouncedSearch]);

  // Load categories once
  useEffect(() => {
    categoryService.getCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    loadProducts();
  }, [categoryId, q, district, pincode, sort, page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getPublicProducts({
        categoryId: categoryId || undefined,
        q: q || undefined,
        district: district || undefined,
        pincode: pincode || undefined,
        sort: sort || undefined,
        page,
        size: PAGE_SIZE,
      });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Update a single URL param, reset page to 0
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
  };

  const hasFilters = categoryId || q || district || pincode || sort;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Browse Products</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-sm transition
            ${showFilters ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
              <input
                value={district}
                onChange={e => updateParam('district', e.target.value)}
                placeholder="e.g., Lucknow"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
              <input
                value={pincode}
                onChange={e => updateParam('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit pincode"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort by</label>
              <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Newest first</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => updateParam('categoryId', '')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
            ${!categoryId ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        {categories.filter(c => c.active !== false).map(cat => (
          <button
            key={cat.id}
            onClick={() => updateParam('categoryId', String(cat.id))}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
              ${String(categoryId) === String(cat.id) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          message="Try different filters or search terms."
          action={hasFilters ? (
            <button onClick={clearFilters} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
              Clear Filters
            </button>
          ) : null}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => updateParam('page', String(p))} />
        </>
      )}
    </div>
  );
}
