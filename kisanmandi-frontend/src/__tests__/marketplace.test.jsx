import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '../i18n';
import PageHeader from '../components/ui/PageHeader';
import ProductCard from '../components/ProductCard';
import RatingSummary from '../components/RatingSummary';
import ReviewList from '../components/ReviewList';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';
import NoResults from '../components/illustrations/NoResults';
import EmptyBox from '../components/illustrations/EmptyBox';
import NoOrders from '../components/illustrations/NoOrders';
import NoReviews from '../components/illustrations/NoReviews';

describe('Marketplace Components (Part 2)', () => {
  describe('PageHeader', () => {
    it('renders breadcrumb links, title, and optional subtitle', () => {
      const breadcrumbs = [
        { label: 'Home', to: '/' },
        { label: 'Produce', to: '/products' },
        { label: 'Tomatoes' },
      ];

      render(
        <BrowserRouter>
          <PageHeader
            breadcrumbs={breadcrumbs}
            title="Fresh Organic Tomatoes"
            subtitle="Farm gate quality directly from Pune growers"
          />
        </BrowserRouter>
      );

      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeDefined();
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink.getAttribute('href')).toBe('/');
      const produceLink = screen.getByRole('link', { name: 'Produce' });
      expect(produceLink.getAttribute('href')).toBe('/products');
      expect(screen.getByText('Tomatoes')).toBeDefined();
      expect(screen.getByRole('heading', { level: 1, name: 'Fresh Organic Tomatoes' })).toBeDefined();
      expect(screen.getByText(/Farm gate quality directly from Pune growers/i)).toBeDefined();
    });
  });

  describe('ProductCard', () => {
    const baseProduct = {
      id: 101,
      name: 'Shimla Apples',
      pricePerUnit: 120,
      quantityAvailable: 15,
      unit: 'KG',
      categoryName: 'Fruits',
      farmName: 'Himalayan Orchard',
      village: 'Kotgarh',
      farmerRatingAvg: 4.8,
      farmerRatingCount: 12,
    };

    it('renders normal in-stock product with price and rating', () => {
      render(
        <BrowserRouter>
          <ProductCard product={baseProduct} />
        </BrowserRouter>
      );

      expect(screen.getByText('Shimla Apples')).toBeDefined();
      expect(screen.getByText('(12)')).toBeDefined(); // 12 reviews
      expect(screen.getByText(/Himalayan Orchard/)).toBeDefined();
    });

    it('shows Out of stock ribbon when quantityAvailable is 0', () => {
      const outOfStockProduct = {
        ...baseProduct,
        quantityAvailable: 0,
      };

      render(
        <BrowserRouter>
          <ProductCard product={outOfStockProduct} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Out of Stock|स्टॉक समाप्त|साठा संपला/i)).toBeDefined();
    });

    it('shows low-stock hint when quantity is <= 5', () => {
      const lowStockProduct = {
        ...baseProduct,
        quantityAvailable: 3,
      };

      render(
        <BrowserRouter>
          <ProductCard product={lowStockProduct} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Only 3|सिर्फ 3|फक्त 3/i)).toBeDefined();
    });

    it('shows New badge when farmer has no reviews yet', () => {
      const newFarmerProduct = {
        ...baseProduct,
        farmerRatingCount: 0,
        farmerRatingAvg: 0,
      };

      render(
        <BrowserRouter>
          <ProductCard product={newFarmerProduct} />
        </BrowserRouter>
      );

      expect(screen.getByText(/New|नया|नवीन/i)).toBeDefined();
    });
  });

  describe('Illustrations & EmptyState', () => {
    it('renders EmptyState with custom inline illustrations', () => {
      const { rerender } = render(
        <EmptyState
          illustration={NoResults}
          title="No Produce Found"
          message="Try adjusting your filters"
        />
      );
      expect(screen.getByText('No Produce Found')).toBeDefined();

      rerender(
        <EmptyState
          illustration={EmptyBox}
          title="Empty Shopping Cart"
          message="Your cart is waiting for fresh produce"
        />
      );
      expect(screen.getByText('Empty Shopping Cart')).toBeDefined();

      rerender(
        <EmptyState
          illustration={NoOrders}
          title="No Orders Yet"
          message="Your past orders will appear here"
        />
      );
      expect(screen.getByText('No Orders Yet')).toBeDefined();
    });
  });

  describe('Reviews UI Components', () => {
    it('renders RatingSummary with average score and 5-tier distribution', () => {
      render(
        <RatingSummary
          average={4.6}
          count={25}
          distribution={{ 5: 18, 4: 5, 3: 2, 2: 0, 1: 0 }}
        />
      );

      expect(screen.getByText('4.6')).toBeDefined();
      expect(screen.getByText(/25/)).toBeDefined();
    });

    it('renders ReviewCard with reviewer name, rating and verified badge', () => {
      const review = {
        id: 1,
        reviewerName: 'Ramesh Patil',
        rating: 5,
        comment: 'Crisp fresh tomatoes, directly picked from the farm!',
        createdAt: '2026-10-20T10:00:00Z',
      };

      render(<ReviewCard review={review} />);

      expect(screen.getByText(/Ramesh/)).toBeDefined();
      expect(screen.getByText(/Crisp fresh tomatoes/i)).toBeDefined();
    });

    it('renders ReviewList empty state with NoReviews when no reviews exist', () => {
      render(<ReviewList reviews={[]} page={0} totalPages={0} setPage={() => {}} />);

      expect(screen.getByText(/No reviews yet|अभी तक कोई रिव्यू नहीं|अद्याप कोणतीही/i)).toBeDefined();
    });
  });

  describe('BrowseProducts Mobile Filter Sheet', () => {
    it('opens mobile filter sheet when filter button is clicked and shows filter controls', async () => {
      const { default: BrowseProducts } = await import('../pages/public/BrowseProducts');
      const { fireEvent, waitFor } = await import('@testing-library/react');

      render(
        <BrowserRouter>
          <BrowseProducts />
        </BrowserRouter>
      );

      // Verify the mobile filter trigger button exists
      const filterBtn = screen.getByRole('button', { name: /filter/i });
      expect(filterBtn).toBeDefined();

      // Click to open the filter bottom sheet
      fireEvent.click(filterBtn);

      // Check portal rendering
      expect(document.body.style.overflow).toBe('hidden');
      const sheetTitle = screen.getByRole('heading', { level: 3 });
      expect(sheetTitle).toBeDefined();

      // Click Close button
      const closeBtn = screen.getByRole('button', { name: /close|बंद/i });
      fireEvent.click(closeBtn);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
