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
import StatusPill from '../../components/ui/StatusPill';
import NumberStepper from '../../components/ui/NumberStepper';
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
  Check,
  X,
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

  // Inline Stock Edit State: productId -> tempQty
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockDraft, setStockDraft] = useState(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

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

  const handleStartStockEdit = (product) => {
    setEditingStockId(product.id);
    setStockDraft(Number(product.quantityAvailable) || 0);
  };

  const handleSaveStock = async (id) => {
    const qty = parseFloat(stockDraft);
    if (isNaN(qty) || qty < 0) {
      toast.error(t('errors.positive_number_required', 'Please enter a valid stock quantity.'));
      return;
    }
    setIsUpdatingStock(true);
    try {
      await productService.updateStock(id, qty);
      toast.success(t('farmer.stock_updated', 'Stock quantity updated!'));
      setEditingStockId(null);
      loadProducts();
    } catch {
      toast.error(t('errors.generic_retry'));
    } finally {
      setIsUpdatingStock(false);
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
      toast.success(t('farmer.product_deleted', 'Product removed successfully.'));
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
              leftIcon={<Plus size={18} />}
              className="shadow-sm font-bold min-h-[44px]"
            >
              {t('farmer.add_new_product')}
            </Button>
          }
        />

        {/* Toolbar: Search input + Status Tabs */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by produce name or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-neutral-100 p-1 rounded-2xl">
            {['ALL', 'ACTIVE', 'HIDDEN'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition min-h-[38px] ${
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
                size="lg"
                leftIcon={<Plus size={18} />}
                className="font-bold min-h-[48px]"
              >
                {t('farmer.add_new_product')}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((p) => {
              const isLowStock = Number(p.quantityAvailable) <= 5 && Number(p.quantityAvailable) > 0;
              const isOutOfStock = Number(p.quantityAvailable) <= 0;
              const isHiddenByAdmin = Boolean(p.hiddenByAdmin);

              const isEditingStock = editingStockId === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                    !p.active ? 'opacity-85 border-neutral-200 bg-neutral-50/40' : 'border-neutral-200/90'
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
                        <Badge variant="neutral" size="sm" className="backdrop-blur-md bg-white/95 font-bold shadow-2xs">
                          {p.categoryName || 'Produce'}
                        </Badge>

                        {/* StatusPill */}
                        <div className="pointer-events-auto">
                          {isHiddenByAdmin ? (
                            <StatusPill
                              tone="problem"
                              size="sm"
                              label="Hidden by admin"
                              title={p.adminNotes || p.moderationReason || 'Violates marketplace listing guidelines'}
                            />
                          ) : !p.active ? (
                            <StatusPill
                              tone="waiting"
                              size="sm"
                              label={t('farmer.hidden_label', 'Hidden')}
                            />
                          ) : (
                            <StatusPill
                              tone="success"
                              size="sm"
                              label={t('farmer.showing_to_customers', 'Showing to customers')}
                            />
                          )}
                        </div>
                      </div>

                      {/* Out of stock or low stock banner */}
                      {isOutOfStock ? (
                        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 text-white text-xs font-bold text-center backdrop-blur-xs">
                          {t('products.out_of_stock', 'Out of Stock')}
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-amber-500/95 text-neutral-950 text-xs font-bold text-center backdrop-blur-xs shadow-xs">
                          {p.name}: only {p.quantityAvailable} {unitLabel(p.unit, t)} left
                        </div>
                      ) : null}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5 font-medium">
                          {p.description || 'Fresh field harvested produce.'}
                        </p>
                      </div>

                      {/* Price & Current Stock */}
                      <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100">
                        <div>
                          <span className="text-xl font-extrabold text-neutral-900 font-mono">
                            {formatINR(p.pricePerUnit)}
                          </span>
                          <span className="text-xs text-neutral-500 ml-1 font-semibold">
                            / {unitLabel(p.unit, t)}
                          </span>
                        </div>

                        {!isEditingStock && (
                          <button
                            type="button"
                            onClick={() => handleStartStockEdit(p)}
                            className="text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 transition"
                            title="Click to update available stock"
                          >
                            Stock: {p.quantityAvailable} {unitLabel(p.unit, t)} ✎
                          </button>
                        )}
                      </div>

                      {/* Inline Stock Update Stepper */}
                      {isEditingStock && (
                        <div className="p-3 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2 animate-in fade-in duration-150">
                          <span className="text-xs font-bold text-brand-950 block">
                            {t('farmer.update_stock_label', 'Update available stock')}:
                          </span>
                          <div className="flex items-center gap-2">
                            <NumberStepper
                              value={stockDraft}
                              onChange={setStockDraft}
                              min={0}
                              max={100000}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              loading={isUpdatingStock}
                              onClick={() => handleSaveStock(p.id)}
                              className="min-h-[44px] px-3 font-bold"
                            >
                              <Check size={16} />
                              <span>{t('common.save', 'Save')}</span>
                            </Button>
                            <button
                              type="button"
                              onClick={() => setEditingStockId(null)}
                              className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-200 transition min-h-[44px]"
                              aria-label={t('common.cancel', 'Cancel')}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row with Clear Labeled Buttons */}
                  <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 rounded-b-3xl flex items-center justify-between gap-2">
                    <Link
                      to={`/farmer/products/edit/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 transition min-h-[38px]"
                    >
                      <Edit size={14} />
                      <span>{t('common.edit', 'Edit')}</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id, p.active)}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition min-h-[38px] ${
                          p.active
                            ? 'text-neutral-600 hover:text-amber-800 bg-white hover:bg-amber-50 border-neutral-200'
                            : 'text-brand-700 bg-brand-50 hover:bg-brand-100 border-brand-200'
                        }`}
                        title={p.active ? t('farmer.hide_product', 'Hide produce') : t('farmer.show_product', 'Show produce')}
                      >
                        {p.active ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{p.active ? t('farmer.hide_btn', 'Hide') : t('farmer.show_btn', 'Show')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteId(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 transition min-h-[38px]"
                        title={t('common.delete', 'Delete')}
                        aria-label="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal (Plain words) */}
        <ConfirmDialog
          isOpen={Boolean(deleteId)}
          title="Delete this product?"
          message="Delete this product? You cannot undo this. Buyers will no longer be able to see or order it."
          confirmText="Yes, delete"
          cancelText="No, keep it"
          confirmStyle="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </DashboardLayout>
  );
}
