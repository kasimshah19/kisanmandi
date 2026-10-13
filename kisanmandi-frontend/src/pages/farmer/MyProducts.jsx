import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { SkeletonCard } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { productService } from '../../services/productService';
import { formatINR, unitLabel } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/image';
import toast from 'react-hot-toast';
import { Edit, Trash2, Eye, EyeOff, Package, Plus } from 'lucide-react';

const MyProducts = () => {
  const { t } = useTranslation();
  useDocumentTitle(`${t('farmer.manage_products')} | KisanMandi`);

  const [products, setProducts] = useState([]);
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
      setProducts(res.data);
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

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('farmer.manage_products')}</h1>
          <Link
            to="/farmer/products/add"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 font-medium min-h-[44px] transition active:scale-[0.99]"
          >
            <Plus size={18} />
            <span>{t('farmer.add_new_product')}</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState
            title={t('errors.generic_retry')}
            message={error}
            onRetry={loadProducts}
          />
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-xs">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">{t('farmer.no_products_yet')}</h3>
            <p className="text-gray-500 mt-2 mb-6">{t('farmer.no_products_yet_desc')}</p>
            <Link
              to="/farmer/products/add"
              className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-800 transition min-h-[44px]"
            >
              <Plus size={18} />
              <span>{t('farmer.add_new_product')}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                  !product.active ? 'opacity-75 border-gray-200' : 'border-gray-200 hover:border-green-300'
                } transition`}
              >
                <div className="h-48 bg-gray-100 relative">
                  <img
                    src={getOptimizedImageUrl(product.imageUrl, 400)}
                    alt={product.name || 'Product'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm ${
                      product.active ? 'bg-green-700 text-white' : 'bg-gray-600 text-white'
                    }`}
                  >
                    {product.active ? t('farmer.active_label') : t('farmer.hidden_label')}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-700 font-bold text-lg">
                      {formatINR(product.pricePerUnit)} / {unitLabel(product.unit, t)}
                    </span>
                    <button
                      onClick={() => handleStockUpdate(product.id, product.quantityAvailable)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 font-medium min-h-[36px]"
                    >
                      {t('farmer.stock_label', { qty: product.quantityAvailable, unit: unitLabel(product.unit, t) })}
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleStatus(product.id, product.active)}
                      aria-label={product.active ? t('farmer.hide_action') : t('farmer.show_action')}
                      className={`text-sm font-medium flex items-center gap-1.5 p-2 rounded-lg ${
                        product.active ? 'text-amber-700 hover:bg-amber-50' : 'text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {product.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>{product.active ? t('farmer.hide_action') : t('farmer.show_action')}</span>
                    </button>

                    <div className="flex space-x-2">
                      <Link
                        to={`/farmer/products/${product.id}/edit`}
                        aria-label={`Edit ${product.name}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        aria-label={`Delete ${product.name}`}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={!!deleteId}
          title={t('farmer.delete_product_title')}
          message={t('farmer.delete_product_msg')}
          confirmText={t('common.delete')}
          isDestructive={true}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyProducts;
