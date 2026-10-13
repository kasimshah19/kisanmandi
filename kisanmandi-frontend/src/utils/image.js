// Default vegetable/produce placeholder image
export const DEFAULT_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%2315803d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';

/**
 * Optimizes an image URL for display cards.
 * If Cloudinary URL, applies w_400 (or specified width) with f_auto,q_auto.
 * Non-Cloudinary URLs and null values are handled gracefully.
 */
export function getOptimizedImageUrl(url, width = 400) {
  if (!url || typeof url !== 'string') {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // Cloudinary URL transformation injection
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transformation = `f_auto,q_auto,w_${width},c_limit`;
    // Prevent double transformations if already present
    if (url.includes('/upload/f_auto') || url.includes('/upload/w_')) {
      return url;
    }
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  // Leave non-Cloudinary URLs as-is
  return url;
}

/**
 * Optimizes an image URL for high-resolution product detail pages (w_900).
 */
export function getDetailImageUrl(url) {
  return getOptimizedImageUrl(url, 900);
}
