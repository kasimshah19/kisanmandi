import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminProductService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/format';
import { Package, Trash2 } from 'lucide-react';

export default function ManageProducts() {
  useDocumentTitle('Manage Products | KisanMandi');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    adminProductService.getProducts(page)
      .then(res => {
        setProducts(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(err => {
        setError('Failed to load products. Please check server connection.');
        toast.error('Failed to load products');
      })
      .finally(() => setLoading(false));
  };

  const deleteProduct = (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    adminProductService.deleteProduct(id)
      .then(() => {
        toast.success('Product deleted');
        loadProducts();
      })
      .catch(() => toast.error('Failed to delete product'));
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">Review, monitor, and manage produce listed by farmers</p>
        </div>

        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ErrorState title="Unable to Load Products" message={error} onRetry={loadProducts} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No products found</p>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.farmerName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatINR(product.pricePerUnit)} / {product.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.quantityAvailable} {product.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            aria-label={`Delete ${product.name}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg min-h-[44px] transition-colors"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && !loading && (
              <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
