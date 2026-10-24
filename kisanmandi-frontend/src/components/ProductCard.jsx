import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImageOff, MapPin, Sparkles } from 'lucide-react';
import { formatINR, unitLabel } from '../utils/format';
import { getOptimizedImageUrl } from '../utils/image';
import StarRating from './StarRating';
import DistanceBadge from './DistanceBadge';

/**
 * ProductCard
 * 4:3 image box, gentle hover zoom, stock badges, farm location, rating, and distance.
 */
export default function ProductCard({ product }) {
  const { t } = useTranslation();

  if (!product) {
    return <ProductCardSkeleton />;
  }

  const price = Number(product.pricePerUnit);
  const stock = Number(product.quantityAvailable);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const unitText = unitLabel(product.unit, t);

  return (
    <Link
      to={`/products/${product.id}`}
      aria-label={`${product.name}, ${formatINR(price)} per ${unitText}`}
      className={`group flex flex-col h-full bg-white rounded-2xl border-2 border-stone-200/90 shadow-2xs hover:shadow-card hover:border-green-600 transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-green-600 relative ${
        isOutOfStock ? 'opacity-80' : ''
      }`}
    >
      {/* 4:3 Image Container with Hover Zoom */}
      <div className="aspect-[4/3] w-full bg-stone-100 overflow-hidden relative shrink-0">
        {product.imageUrl ? (
          <img
            src={getOptimizedImageUrl(product.imageUrl, 400)}
            alt={product.name || 'Produce item'}
            loading="lazy"
            width="400"
            height="300"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}

        {/* Fallback placeholder when no image */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100 ${
            product.imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <ImageOff size={36} className="text-stone-300" />
          <span className="text-[11px] font-medium text-stone-400 mt-1">No photo</span>
        </div>

        {/* Subtle gradient vignette at top for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />

        {/* Category Pill (Top-Left) */}
        {product.categoryName && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/95 text-stone-900 shadow-2xs backdrop-blur-xs border border-white/60">
              {product.categoryName}
            </span>
          </div>
        )}

        {/* Distance Badge (Top-Right) */}
        {product.distanceKm != null && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <DistanceBadge distanceKm={product.distanceKm} />
          </div>
        )}

        {/* Stock Ribbon (Bottom-Left of Image) */}
        {isOutOfStock ? (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-xs">
              {t('products.out_of_stock', 'Not available')}
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-stone-950 shadow-xs">
              <Sparkles size={12} className="text-stone-950" />
              {t('products.low_stock_hint', { count: stock, unit: unitText })}
            </span>
          </div>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Product Name (2 lines clamped) */}
          <h3 className="font-bold text-stone-900 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
            {product.name}
          </h3>

          {/* Farm Name & Location */}
          {(product.farmName || product.village) && (
            <p className="flex items-center gap-1.5 text-xs text-stone-600 mt-1.5 truncate">
              <MapPin size={13} className="text-green-700 shrink-0" />
              <span className="truncate">
                {product.farmName}
                {product.village ? `, ${product.village}` : ''}
              </span>
            </p>
          )}
        </div>

        {/* Footer: Price + Rating */}
        <div className="pt-2.5 border-t border-stone-100 flex items-baseline justify-between gap-2">
          {/* Price */}
          <div className="text-green-800 font-extrabold text-lg sm:text-xl tracking-tight">
            {formatINR(price)}
            <span className="text-xs sm:text-sm font-semibold text-stone-600 ml-1">
              / {unitText}
            </span>
          </div>

          {/* Rating */}
          <div className="shrink-0 flex items-center gap-1">
            {product.farmerRatingCount > 0 ? (
              <div className="flex items-center gap-1">
                <StarRating value={product.farmerRatingAvg} size={14} />
                <span className="text-xs font-semibold text-stone-600 tabular-nums">
                  ({product.farmerRatingCount})
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                {t('products.new_rating', 'New')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * ProductCardSkeleton
 * Skeleton placeholder matching exact ProductCard dimensions to prevent layout shifts.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-2xs animate-pulse">
      <div className="aspect-[4/3] w-full bg-neutral-200" />
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-4/5" />
          <div className="h-3 bg-neutral-200 rounded w-1/2" />
        </div>
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="h-5 bg-neutral-200 rounded w-1/3" />
          <div className="h-3 bg-neutral-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
