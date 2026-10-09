import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ImageOff, Loader2, Check } from 'lucide-react';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import QuantityInput from '../../components/QuantityInput';
import { SkeletonLine } from '../../components/Skeleton';
import { formatINR, unitLabel } from '../../utils/format';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await productService.getPublicProduct(id);
      setProduct(res.data);
      // Set initial quantity based on unit type
      const unit = res.data.unit;
      setQuantity(unit === 'DOZEN' || unit === 'PIECE' ? 1 : 0.5);
    } catch (error) {
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to load product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Not logged in: redirect to login, return here after
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setAdding(true);
    try {
      const roundedQty = Math.round(quantity * 100) / 100;
      await cartService.add(product.id, roundedQty);
      toast.success(`${product.name} added to cart!`);
      setAdded(true);
      refreshCart();
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <SkeletonLine className="h-8 w-3/4" />
            <SkeletonLine className="h-6 w-1/2" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-4">This product may have been removed or is no longer available.</p>
        <Link to="/products" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  const price = Number(product.pricePerUnit);
  const stock = Number(product.quantityAvailable);
  const isOutOfStock = stock <= 0;
  const isFarmerOrAdmin = user?.role === 'FARMER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-green-700 mb-4 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${product.imageUrl ? 'hidden' : ''}`}>
            <ImageOff size={60} />
            <span className="text-sm mt-2">No image available</span>
          </div>
          {isOutOfStock && (
            <div className="absolute top-4 left-0 bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-r-lg">
              Out of Stock
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {product.categoryName}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h1>
          </div>

          <p className="text-3xl font-bold text-green-700">
            {formatINR(price)}
            <span className="text-base text-gray-500 font-normal"> / {unitLabel(product.unit)}</span>
          </p>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <p><span className="text-gray-500">Stock:</span> <span className="font-medium">{stock} {unitLabel(product.unit)}</span></p>
            {product.farmName && <p><span className="text-gray-500">Farm:</span> <span className="font-medium">{product.farmName}</span></p>}
            {product.village && <p><span className="text-gray-500">Village:</span> <span className="font-medium">{product.village}</span></p>}
            {product.district && <p><span className="text-gray-500">District:</span> <span className="font-medium">{product.district}</span></p>}
            {product.farmerName && <p><span className="text-gray-500">Farmer:</span> <span className="font-medium">{product.farmerName}</span></p>}
          </div>

          {/* Cart controls */}
          {isFarmerOrAdmin ? (
            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-200">
              Only customers can place orders.
            </div>
          ) : (
            <div className="space-y-3">
              {!isOutOfStock && (
                <QuantityInput
                  value={quantity}
                  unit={product.unit}
                  maxStock={stock}
                  onChange={setQuantity}
                />
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : added ? (
                  <>
                    <Check size={20} />
                    Added!
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              {added && (
                <Link to="/customer/cart" className="block text-center text-green-600 font-medium text-sm hover:underline">
                  Go to Cart →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
