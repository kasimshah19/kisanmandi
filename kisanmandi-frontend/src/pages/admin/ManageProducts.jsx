import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminProductService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/format';
import { Package, Trash2, Search, User, AlertCircle } from 'lucide-react';

export default function ManageProducts() {
  useDocumentTitle('Manage Products | KisanMandi');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Delete dialog state
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);

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
        const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load products';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    adminProductService.deleteProduct(productToDelete.id)
      .then(() => {
        toast.success(`Product "${productToDelete.name}" deleted successfully`);
        setProductToDelete(null);
        loadProducts();
      })
      .catch(() => {
        toast.error('Failed to delete product');
        setProductToDelete(null);
      });
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="Product Catalog"
          subtitle="Review, audit, and moderate agricultural produce listed by registered farmers"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
        />

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="text-xs font-semibold text-neutral-500">
            Showing platform listings across all categories
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search product or farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <ErrorState title="Unable to Load Products" message={error} onRetry={loadProducts} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">Produce Item</th>
                    <th className="px-5 py-3.5">Farmer / Producer</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Available Stock</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-32"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-20"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-md w-16"></div></td>
                        <td className="px-5 py-4 text-right"><div className="h-8 bg-neutral-200 rounded-xl w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                          <Package className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-neutral-900 mb-1">No products found</p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery ? 'Try adjusting your search criteria.' : 'No listings currently exist in the database.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const isLowStock = (product.quantityAvailable || 0) <= 5;
                      return (
                        <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-neutral-900 text-sm">{product.name}</div>
                            {product.categoryName && (
                              <div className="text-[11px] text-neutral-400 mt-0.5">{product.categoryName}</div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-neutral-800">
                              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="font-medium">{product.farmerName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap font-bold text-neutral-900 tabular-nums">
                            {formatINR(product.pricePerUnit)} <span className="text-neutral-400 text-[11px] font-normal">/ {product.unit}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-800 tabular-nums">
                                {product.quantityAvailable} {product.unit}
                              </span>
                              {isLowStock && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertCircle className="w-2.5 h-2.5" /> Low
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => setProductToDelete(product)}
                              aria-label={`Delete ${product.name}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && !loading && (
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog 
          isOpen={!!productToDelete}
          title="Delete Product Listing"
          message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This will remove the listing from marketplace searches.`}
          confirmText="Delete Product"
          onConfirm={handleConfirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      </div>
    </DashboardLayout>
  );
}
