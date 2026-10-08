import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import { Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productService.getMyProducts();
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockUpdate = async (id, currentQty) => {
    const newQty = prompt('Enter new stock quantity:', currentQty);
    if (newQty === null) return;
    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty < 0) {
      toast.error('Invalid quantity');
      return;
    }
    try {
      await productService.updateStock(id, qty);
      toast.success('Stock updated');
      loadProducts();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await productService.updateStatus(id, !currentStatus);
      toast.success(currentStatus ? 'Product hidden' : 'Product visible');
      loadProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (isLoading) return <DashboardLayout role="FARMER"><div className="p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
          <Link to="/farmer/products/add" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            + Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
            <p className="text-gray-500 mt-2 mb-4">Get started by adding your first product.</p>
            <Link to="/farmer/products/add" className="text-green-600 font-medium hover:underline">
              Add a Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!product.active ? 'opacity-75' : 'border-gray-200'}`}>
                <div className="h-48 bg-gray-100 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded shadow-sm ${product.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {product.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.categoryName}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold text-green-700">₹{product.pricePerUnit}</span>
                      <span className="text-gray-500 text-sm"> / {product.unit}</span>
                    </div>
                    <button 
                      onClick={() => handleStockUpdate(product.id, product.quantityAvailable)}
                      className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                    >
                      Stock: {product.quantityAvailable}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <button 
                      onClick={() => handleToggleStatus(product.id, product.active)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center"
                      title={product.active ? 'Hide Product' : 'Show Product'}
                    >
                      {product.active ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/farmer/products/${product.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => setDeleteId(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
          title="Delete Product"
          message="Are you sure you want to delete this product? It will be removed from the store."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyProducts;
