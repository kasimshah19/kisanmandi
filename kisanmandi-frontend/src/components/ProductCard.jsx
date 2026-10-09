import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { formatINR, unitLabel } from '../utils/format';

// Product card used in BrowseProducts grid
export default function ProductCard({ product }) {
  const price = Number(product.pricePerUnit);
  const stock = Number(product.quantityAvailable);
  const isOutOfStock = stock <= 0;

  return (
    <Link to={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
        {/* Out of stock ribbon */}
        {isOutOfStock && (
          <div className="absolute top-3 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-r-lg z-10">
            Out of Stock
          </div>
        )}

        {/* Product image */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          {/* Fallback placeholder */}
          <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${product.imageUrl ? 'hidden' : ''}`}>
            <ImageOff size={40} />
            <span className="text-xs mt-1">No image</span>
          </div>
        </div>

        {/* Product info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          <p className="text-green-700 font-bold text-lg mt-1">
            {formatINR(price)} <span className="text-sm text-gray-500 font-normal">/ {unitLabel(product.unit)}</span>
          </p>
          {product.farmName && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {product.farmName}{product.village ? `, ${product.village}` : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
