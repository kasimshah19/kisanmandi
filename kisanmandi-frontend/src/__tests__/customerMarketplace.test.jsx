import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '../i18n';
import ProductCard from '../components/ProductCard';
import ReviewForm from '../components/ReviewForm';
import OrderTimeline from '../components/OrderTimeline';
import Cart from '../pages/customer/Cart';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import { cartService } from '../services/cartService';

vi.mock('../services/reviewService', () => ({
  default: {
    createReview: vi.fn().mockResolvedValue({ data: { success: true } }),
    getPublicReviews: vi.fn().mockResolvedValue({ content: [], totalPages: 0 }),
    getPendingReviews: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../services/cartService', () => ({
  cartService: {
    get: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

describe('Customer & Marketplace UI v2 (Part 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. ProductCard States', () => {
    const baseProduct = {
      id: 201,
      name: 'Fresh Organic Spinach',
      pricePerUnit: 40,
      quantityAvailable: 25,
      unit: 'KG',
      categoryName: 'Vegetables',
      farmName: 'Sahyadri Bio Farm',
      village: 'Junnar',
      distanceKm: 12.4,
      farmerRatingAvg: 4.9,
      farmerRatingCount: 18
    };

    it('renders normal in-stock product with formatted price and details', () => {
      render(
        <BrowserRouter>
          <ProductCard product={baseProduct} />
        </BrowserRouter>
      );

      expect(screen.getByText('Fresh Organic Spinach')).toBeDefined();
      expect(screen.getByText(/Sahyadri Bio Farm/)).toBeDefined();
      expect(screen.getByText(/12\.4/)).toBeDefined();
    });

    it('displays plain words Out of Stock / Not available when stock is 0', () => {
      const outOfStock = { ...baseProduct, quantityAvailable: 0 };
      render(
        <BrowserRouter>
          <ProductCard product={outOfStock} />
        </BrowserRouter>
      );

      expect(
        screen.getByText(/Not available|Out of Stock|स्टॉक समाप्त|साठा संपला/i)
      ).toBeDefined();
    });

    it('displays plain words low-stock hint when stock is <= 5', () => {
      const lowStock = { ...baseProduct, quantityAvailable: 3 };
      render(
        <BrowserRouter>
          <ProductCard product={lowStock} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Only 3|सिर्फ 3|फक्त 3/i)).toBeDefined();
    });

    it('displays New rating badge when farmer has no prior ratings', () => {
      const newFarmer = {
        ...baseProduct,
        farmerRatingCount: 0,
        farmerRatingAvg: 0
      };
      render(
        <BrowserRouter>
          <ProductCard product={newFarmer} />
        </BrowserRouter>
      );

      expect(screen.getByText(/New|नया|नवीन/i)).toBeDefined();
    });
  });

  describe('2. ReviewForm Face Row & Stars Parity', () => {
    it('sets rating when face button is clicked and syncs with submission payload', async () => {
      const onSuccess = vi.fn();

      render(<ReviewForm orderId={999} onSuccess={onSuccess} />);

      // Verify the 5 face options exist with radiogroup
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeDefined();

      const faceButtons = screen.getAllByRole('radio');
      expect(faceButtons.length).toBe(5);

      // Click the 5th face (Very good / 5 stars)
      fireEvent.click(faceButtons[4]);

      // Check that rating label displays 5 / 5
      expect(screen.getByText('5 / 5')).toBeDefined();

      // Enter optional comment
      const commentInput = screen.getByPlaceholderText(/Share details|अनुभव|तपशील/i);
      fireEvent.change(commentInput, { target: { value: 'Great sweet mangoes!' } });

      // Character counter should update (20 characters)
      expect(screen.getByText('20 / 500')).toBeDefined();

      // Click submit
      const submitBtn = screen.getByRole('button', { name: /Submit Review|रिव्यू सबमिट|रिव्ह्यू सबमिट/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(reviewService.createReview).toHaveBeenCalledWith({
          orderId: 999,
          rating: 5,
          comment: 'Great sweet mangoes!'
        });
      });
    });

    it('selecting face 2 sets rating 2 and syncs with StarRating', () => {
      render(<ReviewForm orderId={888} />);
      const faceButtons = screen.getAllByRole('radio');

      fireEvent.click(faceButtons[1]); // Not good (2)
      expect(screen.getByText('2 / 5')).toBeDefined();
    });
  });

  describe('3. OrderTimeline Progress States', () => {
    it('marks completed steps with Done badge and checkmark for normal happy path', () => {
      const history = [
        { status: 'PLACED', changedAt: '2026-10-24T10:00:00Z' },
        { status: 'ACCEPTED', changedAt: '2026-10-24T11:00:00Z' }
      ];

      render(<OrderTimeline history={history} currentStatus="PACKED" />);

      // Placed and Accepted should have "Done" badges
      const doneBadges = screen.getAllByText(/Done|पूरा हुआ|पूर्ण/i);
      expect(doneBadges.length).toBeGreaterThanOrEqual(2);

      // Packed is current
      expect(screen.getByText(/Current/i)).toBeDefined();
    });

    it('displays red error state with reason for CANCELLED orders', () => {
      const history = [
        { status: 'PLACED', changedAt: '2026-10-24T10:00:00Z' },
        { status: 'CANCELLED', changedAt: '2026-10-24T10:30:00Z', note: 'Customer changed mind' }
      ];

      render(<OrderTimeline history={history} currentStatus="CANCELLED" />);

      const cancelledElements = screen.getAllByText(/Cancelled|रद्द/i);
      expect(cancelledElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Customer changed mind/i)).toBeDefined();
    });

    it('displays red error state with reason for REJECTED orders', () => {
      const history = [
        { status: 'PLACED', changedAt: '2026-10-24T10:00:00Z' },
        { status: 'REJECTED', changedAt: '2026-10-24T10:45:00Z', note: 'Heavy rains flooded crops' }
      ];

      render(<OrderTimeline history={history} currentStatus="REJECTED" />);

      const rejectedElements = screen.getAllByText(/Could not accept|स्वीकार नहीं|नाकारली/i);
      expect(rejectedElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Heavy rains flooded crops/i)).toBeDefined();
    });
  });

  describe('4. Cart Unavailable Items & Checkout Guard', () => {
    it('renders unavailable item warning and disables place order button', async () => {
      cartService.get.mockResolvedValue({
        data: {
          id: 501,
          itemCount: 2,
          totalAmount: 320,
          items: [
            {
              id: 1,
              productId: 101,
              name: 'Fresh Carrots',
              pricePerUnit: 40,
              quantity: 3,
              lineTotal: 120,
              available: true,
              farmName: 'Pune Greens',
              village: 'Khed'
            },
            {
              id: 2,
              productId: 102,
              name: 'Organic Strawberries',
              pricePerUnit: 200,
              quantity: 1,
              lineTotal: 200,
              available: false, // UNAVAILABLE ITEM
              unavailableReason: 'Out of stock after morning harvest',
              farmName: 'Mahabaleshwar Berries',
              village: 'Panchgani'
            }
          ]
        }
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <CartProvider>
              <Cart />
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Fresh Carrots/i)).toBeDefined();
        expect(screen.getByText(/Organic Strawberries/i)).toBeDefined();
      });

      // Check warning message for unavailable item
      expect(
        screen.getAllByText(/Out of stock after morning harvest|unavailable/i).length
      ).toBeGreaterThanOrEqual(1);

      // Place order button should be disabled because one item is unavailable
      const checkoutButtons = screen.getAllByRole('button', { name: /Place order|ऑर्डर दें/i });
      expect(checkoutButtons.length).toBeGreaterThanOrEqual(1);
      expect(checkoutButtons[0].hasAttribute('disabled')).toBe(true);
    });
  });
});
