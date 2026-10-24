import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import EmptyBox from '../../components/illustrations/EmptyBox';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { productService } from '../../services/productService';
import { formatINR, unitLabel } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import toast from 'react-hot-toast';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Layers,
  AlertTriangle
} from 'lucide-react';

export default function MyProducts() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.manage_products')} | KisanMandi`);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, HIDDEN
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getMyProducts();
      setProducts(res.data || []);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockUpdate = async (id, currentQty) => {
    const newQty = prompt(t('farmer.stock_available_label'), currentQty);
    if (newQty === null) return;
    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty < 0) {
      toast.error(t('errors.positive_number_required'));
      return;
    }
    try {
      await productService.updateStock(id, qty);
      toast.success(t('common.save'));
      loadProducts();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await productService.updateStatus(id, !currentStatus);
      toast.success(currentStatus ? t('farmer.hidden_label') : t('farmer.active_label'));
      loadProducts();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      toast.success(t('common.delete'));
      setDeleteId(null);
      loadProducts();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  // Filter products by search input and status
  const filteredProducts = products.filter((p) => {
    if (p.deleted) return false;
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return p.active;
    if (statusFilter === 'HIDDEN') return !p.active;
    return true;
  });

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.dashboard'), to: '/farmer/dashboard' },
            { label: t('farmer.manage_products') },
          ]}
          title={t('farmer.manage_products')}
          subtitle="Manage prices, inventory quantities, and marketplace visibility for all your crops."
          actions={
            <Button
              as={Link}
              to="/farmer/products/add"
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
            >
              {t('farmer.add_new_product')}
            </Button>
          }
        />

        {/* Toolbar: Search input + Status Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by produce name or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-neutral-100 p-1 rounded-xl">
            {['ALL', 'ACTIVE', 'HIDDEN'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === filter
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {filter === 'ALL'
                  ? 'All'
                  : filter === 'ACTIVE'
                  ? t('farmer.active_label')
                  : t('farmer.hidden_label')}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState title={t('errors.generic_retry')} message={error} onRetry={loadProducts} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            illustration={EmptyBox}
            title={searchTerm ? 'No matching produce found' : 'No produce listed yet'}
            message={
              searchTerm
                ? 'Try searching with another crop keyword or reset filters.'
                : 'Start listing your harvested crops to reach thousands of neighborhood customers.'
            }
            action={
              <Button
                as={Link}
                to="/farmer/products/add"
                variant="primary"
                size="md"
                leftIcon={<Plus size={16} />}
              >
                {t('farmer.add_new_product')}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((p) => {
              const isLowStock = Number(p.quantityAvailable) <= 5;
              const isOutOfStock = Number(p.quantityAvailable) <= 0;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                    !p.active ? 'opacity-80 border-neutral-200 bg-neutral-50/50' : 'border-neutral-200/90'
                  }`}
                >
                  <div>
                    {/* 4:3 Aspect Image Box */}
                    <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={getOptimizedImageUrl(p.imageUrl, 400, 300)}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f5f5f4"><rect width="400" height="300" fill="%23f5f5f4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23a8a29e">Produce Image</text></svg>';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <Badge variant="neutral" size="sm" className="backdrop-blur-md bg-white/90">
                          {p.categoryName || 'General'}
                        </Badge>

                        <div className="flex items-center gap-1.5">
                          {p.active ? (
                            <Badge variant="brand" size="sm">
                              {t('farmer.active_label')}
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              {t('farmer.hidden_label')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Out of stock or low stock banner */}
                      {isOutOfStock ? (
                        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-neutral-900/85 text-white text-xs font-bold text-center backdrop-blur-xs">
                          {t('products.out_of_stock')}
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-amber-500/90 text-neutral-950 text-xs font-bold text-center backdrop-blur-xs">
                          Only {p.quantityAvailable} {unitLabel(p.unit, t)} left
                        </div>
                      ) : null}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-base text-neutral-900 line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                          {p.description || 'Fresh field harvested produce.'}
                        </p>
                      </div>

                      {/* Price & Current Stock */}
                      <div className="flex items-baseline justify-between pt-1 border-t border-neutral-100">
                        <div>
                          <span className="text-lg font-extrabold text-neutral-900 font-mono">
                            {formatINR(p.pricePerUnit)}
                          </span>
                          <span className="text-xs text-neutral-500 ml-1 font-medium">
                            / {unitLabel(p.unit, t)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleStockUpdate(p.id, p.quantityAvailable)}
                          className="text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
                          title="Click to update quantity"
                        >
                          Stock: {p.quantityAvailable} {unitLabel(p.unit, t)} ✎
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="p-4 border-t border-neutral-100 bg-neutral-50/60 rounded-b-3xl flex items-center justify-between gap-2">
                    <Link
                      to={`/farmer/products/edit/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:text-neutral-950 hover:bg-white border border-neutral-200 transition"
                    >
                      <Edit size={14} />
                      <span>{t('common.edit')}</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(p.id, p.active)}
                        className={`p-2 rounded-xl border transition ${
                          p.active
                            ? 'text-neutral-500 hover:text-amber-700 hover:bg-amber-50 border-neutral-200'
                            : 'text-brand-700 hover:bg-brand-50 border-brand-200'
                        }`}
                        title={p.active ? t('farmer.hide_product') : t('farmer.show_product')}
                        aria-label={p.active ? 'Hide listing' : 'Activate listing'}
                      >
                        {p.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-neutral-200 transition"
                        title={t('common.delete')}
                        aria-label="Delete listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={Boolean(deleteId)}
          title="Delete Produce Listing"
          message="Are you sure you want to remove this crop listing from KisanMandi? This action cannot be undone."
          confirmText={t('common.delete')}
          confirmStyle="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </DashboardLayout>
  );
}
