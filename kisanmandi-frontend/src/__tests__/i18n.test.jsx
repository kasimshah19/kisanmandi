import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { formatDate, formatDateTime, formatShortDate, getDateLocale, unitLabel } from '../utils/format';
import { getOrderStatusLabel } from '../utils/orderStatus';
import fs from 'node:fs';
import path from 'node:path';

// Helper to flatten nested JSON translation objects
function flattenKeys(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value, fullPath));
    } else {
      result[fullPath] = value;
    }
  }
  return result;
}

describe('i18n Language Toggle & Translation System', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('switches language and translates UI keys', async () => {
    expect(i18n.t('nav.home')).toBe('Home');
    expect(i18n.t('nav.browse')).toBe('Buy Produce');

    await act(async () => {
      await i18n.changeLanguage('hi');
    });
    expect(i18n.t('nav.home')).toBe('होम');
    expect(i18n.t('nav.browse')).toBe('सब्जियां व फसल खरीदें');

    await act(async () => {
      await i18n.changeLanguage('mr');
    });
    expect(i18n.t('nav.home')).toBe('होम');
    expect(i18n.t('nav.browse')).toBe('शेतमाल खरेदी करा');
  });

  it('updates Navbar rendered text when language is changed', async () => {
    const { unmount } = render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getAllByText('Buy Produce').length).toBeGreaterThan(0);

    await act(async () => {
      await i18n.changeLanguage('mr');
    });

    expect(screen.getAllByText('शेतमाल खरेदी करा').length).toBeGreaterThan(0);
    unmount();
  });

  it('updates document.documentElement.lang attribute on language change', async () => {
    await act(async () => {
      await i18n.changeLanguage('mr');
    });
    expect(document.documentElement.lang).toBe('mr');

    await act(async () => {
      await i18n.changeLanguage('hi');
    });
    expect(document.documentElement.lang).toBe('hi');

    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to English when a key is missing in target language', async () => {
    // Add a temporary English-only key
    i18n.addResource('en', 'translation', 'test_fallback_key', 'English Original Text');

    await act(async () => {
      await i18n.changeLanguage('mr');
    });

    // In Marathi, the key should fall back to English
    expect(i18n.t('test_fallback_key')).toBe('English Original Text');
  });

  it('formats dates using current language locale with Latin numerals', async () => {
    const testIso = '2026-10-15T10:00:00Z';

    // English
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(getDateLocale()).toBe('en-IN');
    const enDate = formatDate(testIso);
    expect(enDate).toMatch(/15.*Oct.*2026/i);

    // Hindi
    await act(async () => {
      await i18n.changeLanguage('hi');
    });
    expect(getDateLocale()).toBe('hi-IN-u-nu-latn');
    const hiDate = formatDate(testIso);
    // Month in Hindi Devanagari script, but digits are 15 and 2026
    expect(hiDate).toContain('15');
    expect(hiDate).toContain('2026');

    // Marathi
    await act(async () => {
      await i18n.changeLanguage('mr');
    });
    expect(getDateLocale()).toBe('mr-IN-u-nu-latn');
    const mrDate = formatDate(testIso);
    // Month in Marathi Devanagari script, but digits are 15 and 2026
    expect(mrDate).toContain('15');
    expect(mrDate).toContain('2026');
  });

  it('correctly handles pluralization and interpolation', async () => {
    // English interpolation & plural
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(i18n.t('reviews.based_on_reviews', { count: 1 })).toBe('Based on 1 review');
    expect(i18n.t('reviews.based_on_reviews', { count: 12 })).toBe('Based on 12 reviews');
    expect(i18n.t('products.distance_away', { distance: '4.2 km' })).toBe('4.2 km away');

    // Marathi interpolation & plural
    await act(async () => {
      await i18n.changeLanguage('mr');
    });
    expect(i18n.t('reviews.based_on_reviews', { count: 1 })).toBe('1 अभिप्रायावर आधारित');
    expect(i18n.t('reviews.based_on_reviews', { count: 5 })).toBe('5 अभिप्रायांवर आधारित');
    expect(i18n.t('products.distance_away', { distance: '4.2 km' })).toBe('4.2 km अंतरावर');

    // Hindi interpolation & plural
    await act(async () => {
      await i18n.changeLanguage('hi');
    });
    expect(i18n.t('reviews.based_on_reviews', { count: 1 })).toBe('1 रिव्यू के आधार पर');
    expect(i18n.t('reviews.based_on_reviews', { count: 8 })).toBe('8 रिव्यू के आधार पर');
    expect(i18n.t('products.distance_away', { distance: '4.2 km' })).toBe('4.2 km दूर');
  });

  it('translates order statuses and units via lookup helpers', async () => {
    // English
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(getOrderStatusLabel('OUT_FOR_DELIVERY')).toBe('Out for Delivery');
    expect(unitLabel('QUINTAL')).toBe('quintal');

    // Marathi
    await act(async () => {
      await i18n.changeLanguage('mr');
    });
    expect(getOrderStatusLabel('OUT_FOR_DELIVERY')).toBe('डिलिव्हरीवर');
    expect(unitLabel('QUINTAL')).toBe('क्विंटल');

    // Hindi
    await act(async () => {
      await i18n.changeLanguage('hi');
    });
    expect(getOrderStatusLabel('OUT_FOR_DELIVERY')).toBe('डिलीवरी पर');
    expect(unitLabel('QUINTAL')).toBe('क्विंटल');
  });

  it('verifies 100% key set parity across en, hi, and mr json locale files', () => {
    const localesDir = path.resolve(__dirname, '../locales');
    const enJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
    const hiJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));
    const mrJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr.json'), 'utf8'));

    const enKeys = Object.keys(flattenKeys(enJson)).sort();
    const hiKeys = Object.keys(flattenKeys(hiJson)).sort();
    const mrKeys = Object.keys(flattenKeys(mrJson)).sort();

    expect(enKeys.length).toBeGreaterThan(400);
    expect(hiKeys).toEqual(enKeys);
    expect(mrKeys).toEqual(enKeys);
  });
});
