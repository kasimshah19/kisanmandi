import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminProductService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = () => {
    setLoading(true);
    adminProductService.getProducts(page).then(res => {
      setProducts(res.content);
      setTotalPages(res.totalPages);
    }).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false));
  };

  const deleteProduct = (id) => {
    if(!window.confirm('Delete this product?')) return;
    adminProductService.deleteProduct(id).then(() => {
      toast.success('Product deleted');
      loadProducts();
    }).catch(() => toast.error('Failed to delete'));
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.farmerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.pricePerUnit} / {product.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantityAvailable}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
