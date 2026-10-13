import { describe, it, expect } from 'vitest';
import {
  formatINR,
  formatPrice,
  formatDate,
  orderNumber,
  unitLabel,
  quantityStep,
  minQuantity,
  perKg,
} from '../utils/format';
import { formatDistance } from '../utils/geo';
import { getOptimizedImageUrl, getDetailImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/image';

describe('format.js utilities', () => {
  describe('formatINR', () => {
    it('formats positive numbers as INR currency', () => {
      const result = formatINR(500);
      expect(result).toContain('500');
      expect(result).toMatch(/₹|Rs/);
    });

    it('formats string numbers correctly', () => {
      const result = formatINR('1250.50');
      expect(result).toContain('1,250.50');
    });

    it('returns ₹0.00 for null, undefined, and empty string', () => {
      expect(formatINR(null)).toBe('₹0.00');
      expect(formatINR(undefined)).toBe('₹0.00');
      expect(formatINR('')).toBe('₹0.00');
    });

    it('returns ₹0.00 for non-numeric input', () => {
      expect(formatINR('invalid')).toBe('₹0.00');
    });
  });

  describe('formatDate', () => {
    it('formats valid ISO dates into day, short month, year', () => {
      const result = formatDate('2026-10-15T10:00:00Z');
      expect(result).toMatch(/15.*Oct.*2026/i);
    });

    it('returns empty string for null, undefined, or empty values', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('returns empty string for invalid date strings', () => {
      expect(formatDate('not-a-date')).toBe('');
    });
  });

  describe('orderNumber', () => {
    it('pads numeric order IDs with leading zeros', () => {
      expect(orderNumber(1)).toBe('KM-00001');
      expect(orderNumber(42)).toBe('KM-00042');
      expect(orderNumber('789')).toBe('KM-00789');
    });
  });

  describe('unitLabel', () => {
    it('maps backend unit enums to human readable lowercase labels', () => {
      expect(unitLabel('KG')).toBe('kg');
      expect(unitLabel('QUINTAL')).toBe('quintal');
      expect(unitLabel('DOZEN')).toBe('dozen');
      expect(unitLabel('PIECE')).toBe('piece');
      expect(unitLabel('LITRE')).toBe('litre');
    });

    it('handles unexpected units gracefully', () => {
      expect(unitLabel('BAG')).toBe('bag');
      expect(unitLabel(null)).toBe('');
    });
  });

  describe('quantityStep and minQuantity', () => {
    it('returns step 1 and min 1 for discrete units (DOZEN, PIECE)', () => {
      expect(quantityStep('DOZEN')).toBe(1);
      expect(minQuantity('DOZEN')).toBe(1);
      expect(quantityStep('PIECE')).toBe(1);
      expect(minQuantity('PIECE')).toBe(1);
    });

    it('returns step 0.5 and min 0.5 for continuous units (KG, LITRE, QUINTAL)', () => {
      expect(quantityStep('KG')).toBe(0.5);
      expect(minQuantity('KG')).toBe(0.5);
      expect(quantityStep('LITRE')).toBe(0.5);
      expect(minQuantity('LITRE')).toBe(0.5);
      expect(quantityStep('QUINTAL')).toBe(0.5);
      expect(minQuantity('QUINTAL')).toBe(0.5);
    });
  });

  describe('perKg', () => {
    it('converts quintal price to per kg price by dividing by 100', () => {
      expect(perKg(3500)).toBe('35.00');
      expect(perKg('2750')).toBe('27.50');
    });

    it('handles null, undefined, and invalid values gracefully', () => {
      expect(perKg(null)).toBe('0.00');
      expect(perKg(undefined)).toBe('0.00');
      expect(perKg('xyz')).toBe('0.00');
    });
  });
});

describe('geo.js formatDistance', () => {
  it('formats distances less than 1 km in meters', () => {
    expect(formatDistance(0.45)).toBe('450 m');
    expect(formatDistance(0.08)).toBe('80 m');
  });

  it('formats distances 1 km and above in kilometers with 1 decimal place', () => {
    expect(formatDistance(1.23)).toBe('1.2 km');
    expect(formatDistance(15.78)).toBe('15.8 km');
  });

  it('returns empty string for null or undefined input', () => {
    expect(formatDistance(null)).toBe('');
    expect(formatDistance(undefined)).toBe('');
  });
});

describe('image.js image optimization', () => {
  it('injects Cloudinary transformation for list cards (w_400, f_auto, q_auto)', () => {
    const original = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const optimized = getOptimizedImageUrl(original, 400);
    expect(optimized).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,c_limit/sample.jpg');
  });

  it('injects Cloudinary transformation for product detail page (w_900)', () => {
    const original = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const detail = getDetailImageUrl(original);
    expect(detail).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_900,c_limit/sample.jpg');
  });

  it('leaves non-Cloudinary image URLs untouched', () => {
    const s3Url = 'https://my-bucket.s3.amazonaws.com/produce/apple.jpg';
    expect(getOptimizedImageUrl(s3Url)).toBe(s3Url);
    expect(getDetailImageUrl(s3Url)).toBe(s3Url);
  });

  it('returns default fallback SVG for null or empty URLs', () => {
    expect(getOptimizedImageUrl(null)).toBe(DEFAULT_PRODUCT_IMAGE);
    expect(getOptimizedImageUrl('')).toBe(DEFAULT_PRODUCT_IMAGE);
    expect(getOptimizedImageUrl(undefined)).toBe(DEFAULT_PRODUCT_IMAGE);
  });

  it('does not double transform already transformed Cloudinary URLs', () => {
    const transformed = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400/sample.jpg';
    expect(getOptimizedImageUrl(transformed)).toBe(transformed);
  });
});
