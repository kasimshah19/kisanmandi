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

/**
 * Client-side image compression for low-bandwidth farmer connections.
 * Constrains max side to 1600px and JPEG quality to 0.8.
 * Falls back to original File if compression fails or makes the file larger.
 *
 * @param {File} file
 * @param {number} [maxDimension=1600]
 * @param {number} [quality=0.8]
 * @returns {Promise<File>}
 */
export async function compressImage(file, maxDimension = 1600, quality = 0.8) {
  if (!file || !(file instanceof File)) return file;

  // Don't compress non-images or SVGs
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    // Environment safety: browser only
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      !window.FileReader ||
      !document.createElement
    ) {
      return resolve(file);
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // If dimensions are small and file size is under 500KB, skip resizing
          if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
            return resolve(file);
          }

          // Calculate scaled dimensions
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve(file);
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                // If compression failed or is larger, return original
                return resolve(file);
              }

              const targetName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
              const compressedFile = new File([blob], targetName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch {
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
