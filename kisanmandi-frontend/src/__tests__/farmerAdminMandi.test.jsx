import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { CustomChartTooltip } from '../components/charts/chartTheme';
import { computeOnboardingStep } from '../pages/farmer/FarmerDashboard';
import DashboardLayout from '../components/DashboardLayout';
import ProductForm from '../components/ProductForm';
import MandiDashboard from '../pages/public/MandiDashboard';
import * as AuthContextModule from '../context/AuthContext';
import { categoryService } from '../services/categoryService';
import { farmerService } from '../services/farmerService';
import { mandiService } from '../services/mandiService';
import { TrendingUp } from 'lucide-react';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock farmerOrderService
vi.mock('../services/farmerOrderService', () => ({
  farmerOrderService: {
    summary: vi.fn().mockResolvedValue({ data: { placed: 3 } }),
  },
}));

// Mock categoryService
vi.mock('../services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Vegetables' },
        { id: '2', name: 'Fruits' },
        { id: '3', name: 'Grains' },
      ],
    }),
  },
}));

// Mock farmerService
vi.mock('../services/farmerService', () => ({
  farmerService: {
    getProfile: vi.fn().mockResolvedValue({
      data: {
        state: 'Maharashtra',
        district: 'Nashik',
        farmName: 'Sahyadri Orchards',
      },
    }),
  },
}));

// Mock mandiService
vi.mock('../services/mandiService', () => ({
  mandiService: {
    getStatus: vi.fn().mockResolvedValue({
      data: {
        latestPriceDate: '2026-10-24',
        running: false,
      },
    }),
    getStates: vi.fn().mockResolvedValue({ data: ['Maharashtra'] }),
    getDistricts: vi.fn().mockResolvedValue({ data: ['Nashik', 'Pune'] }),
    getMarkets: vi.fn().mockResolvedValue({ data: ['Nashik APMC'] }),
    getCommodities: vi.fn().mockResolvedValue({ data: ['Tomato', 'Potato', 'Onion'] }),
    getSummary: vi.fn().mockResolvedValue({
      data: {
        commodity: 'Tomato',
        avgModal: 1367,
        minPrice: 1100,
        maxPrice: 1600,
        priceDate: '2026-10-24',
      },
    }),
    getTrend: vi.fn().mockResolvedValue({
      data: {
        points: [
          { date: '2026-10-23', avgModal: 1317 },
          { date: '2026-10-24', avgModal: 1367 },
        ],
      },
    }),
    getCompare: vi.fn().mockResolvedValue({
      data: {
        points: [
          { market: 'Nashik APMC', district: 'Nashik', modalPrice: 1400 },
          { market: 'Lasalgaon Mandi', district: 'Nashik', modalPrice: 1380 },
          { market: 'Pimpalgaon Mandi', district: 'Nashik', modalPrice: 1350 },
        ],
      },
    }),
    getPrices: vi.fn().mockResolvedValue({
      data: {
        content: [],
        totalPages: 0,
      },
    }),
  },
}));

describe('Farmer, Admin & Mandi (Part 4) Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    AuthContextModule.useAuth.mockReturnValue({
      user: { name: 'Ramesh Patel', role: 'FARMER' },
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  describe('1. Onboarding Checklist Progression per Status', () => {
    it('returns step 1 (COMPLETE_PROFILE) when profile is not submitted / missing details', () => {
      const step = computeOnboardingStep({ approvalStatus: 'NOT_SUBMITTED' }, 0);
      expect(step.approvalStatus).toBe('NOT_SUBMITTED');
      expect(step.stepProfileComplete).toBe(false);
      expect(step.currentStep).toBe(1);
      expect(step.nextActionKey).toBe('COMPLETE_PROFILE');
    });

    it('returns step 2 (UPLOAD_DOCUMENT) when profile details are entered but document is missing', () => {
      const profile = {
        approvalStatus: 'NOT_SUBMITTED',
        farmName: 'Green Acres',
        district: 'Nashik',
        state: 'Maharashtra',
        documentSubmitted: false,
        documentUrl: null,
      };
      const step = computeOnboardingStep(profile, 0);
      expect(step.stepProfileComplete).toBe(true);
      expect(step.stepDocUploaded).toBe(false);
      expect(step.currentStep).toBe(2);
      expect(step.nextActionKey).toBe('UPLOAD_DOCUMENT');
    });

    it('returns step 3 (WAIT_FOR_APPROVAL) when status is PENDING and document is submitted', () => {
      const profile = {
        approvalStatus: 'PENDING',
        farmName: 'Green Acres',
        district: 'Nashik',
        state: 'Maharashtra',
        documentSubmitted: true,
      };
      const step = computeOnboardingStep(profile, 0);
      expect(step.approvalStatus).toBe('PENDING');
      expect(step.stepApproved).toBe(false);
      expect(step.currentStep).toBe(3);
      expect(step.nextActionKey).toBe('WAIT_FOR_APPROVAL');
    });

    it('returns step 3 (CHECK_STATUS_REJECTED) when status is REJECTED', () => {
      const profile = {
        approvalStatus: 'REJECTED',
        farmName: 'Green Acres',
        district: 'Nashik',
        state: 'Maharashtra',
        documentSubmitted: true,
      };
      const step = computeOnboardingStep(profile, 0);
      expect(step.approvalStatus).toBe('REJECTED');
      expect(step.stepApproved).toBe(false);
      expect(step.currentStep).toBe(3);
      expect(step.nextActionKey).toBe('CHECK_STATUS_REJECTED');
    });

    it('returns step 4 (ADD_FIRST_PRODUCT) when APPROVED but 0 products listed', () => {
      const profile = {
        approvalStatus: 'APPROVED',
        farmName: 'Green Acres',
        district: 'Nashik',
        state: 'Maharashtra',
        documentSubmitted: true,
      };
      const step = computeOnboardingStep(profile, 0);
      expect(step.approvalStatus).toBe('APPROVED');
      expect(step.stepApproved).toBe(true);
      expect(step.stepProductAdded).toBe(false);
      expect(step.currentStep).toBe(4);
      expect(step.nextActionKey).toBe('ADD_FIRST_PRODUCT');
    });

    it('returns step 5 (ALL_DONE) when APPROVED and has listed products', () => {
      const profile = {
        approvalStatus: 'APPROVED',
        farmName: 'Green Acres',
        district: 'Nashik',
        state: 'Maharashtra',
        documentSubmitted: true,
      };
      const step = computeOnboardingStep(profile, 4);
      expect(step.stepApproved).toBe(true);
      expect(step.stepProductAdded).toBe(true);
      expect(step.currentStep).toBe(5);
      expect(step.nextActionKey).toBe('ALL_DONE');
    });
  });

  describe('2. StatCard Safe Numeric Rendering (Zero and never NaN)', () => {
    it('renders clean "0" and never NaN when value is null or undefined for counts', () => {
      const { rerender } = render(
        <StatCard title="Total Orders" value={null} icon={TrendingUp} />
      );
      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.queryByText(/NaN/i)).toBeNull();

      rerender(
        <StatCard title="Total Orders" value={undefined} icon={TrendingUp} />
      );
      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.queryByText(/NaN/i)).toBeNull();
    });

    it('renders clean "0" and never NaN when invalid string or NaN is passed to count card', () => {
      render(
        <StatCard title="Total Customers" value={NaN} icon={TrendingUp} />
      );
      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.queryByText(/NaN/i)).toBeNull();
    });

    it('renders clean zero currency when 0 is explicitly passed without NaN', () => {
      render(
        <StatCard title="Today's Revenue" value={0} type="currency" icon={TrendingUp} />
      );
      expect(screen.getByText(/₹0/)).toBeTruthy();
      expect(screen.queryByText(/NaN/i)).toBeNull();
    });

    it('renders formatted real values with commas and never NaN', () => {
      render(
        <StatCard title="Monthly Sales" value={45200} type="currency" icon={TrendingUp} />
      );
      expect(screen.getByText(/45,200/)).toBeTruthy();
      expect(screen.queryByText(/NaN/i)).toBeNull();
    });
  });

  describe('3. chartTheme CustomTooltip Formatting', () => {
    it('formats currency payloads with INR formatting', () => {
      const payload = [{ name: 'Earnings', value: 12500, color: '#15803d' }];
      render(
        <CustomChartTooltip active={true} payload={payload} label="24 Oct" isCurrency={true} />
      );
      expect(screen.getByText('24 Oct')).toBeTruthy();
      expect(screen.getByText('Earnings:')).toBeTruthy();
      expect(screen.getByText(/₹12,500/)).toBeTruthy();
    });

    it('formats count payloads without rupee symbol when isCurrency is false', () => {
      const payload = [{ name: 'Orders', value: 1420, color: '#2563eb' }];
      render(
        <CustomChartTooltip active={true} payload={payload} label="Nasik Mandi" isCurrency={false} />
      );
      expect(screen.getByText('Nasik Mandi')).toBeTruthy();
      expect(screen.getByText('Orders:')).toBeTruthy();
      expect(screen.getByText('1,420')).toBeTruthy();
    });

    it('returns null when tooltip is inactive or has empty payload', () => {
      const { container } = render(
        <CustomChartTooltip active={false} payload={[]} label="Empty" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('4. DashboardLayout Bottom Navigation & Orders Badge', () => {
    it('shows the orders badge in the bottom navigation for farmers', async () => {
      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <DashboardLayout role="FARMER">
            <div>Dashboard Content</div>
          </DashboardLayout>
        </MemoryRouter>
      );

      // Wait for farmerOrderService summary to resolve with placed: 3
      await waitFor(() => {
        const badges = screen.getAllByText('3');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('opens mobile drawer when hamburger button is clicked and closes on Escape key', async () => {
      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <DashboardLayout role="FARMER">
            <div data-testid="dashboard-content">Farmer Content Area</div>
          </DashboardLayout>
        </MemoryRouter>
      );

      const openButton = screen.getByRole('button', { name: /Open sidebar menu/i });
      act(() => {
        fireEvent.click(openButton);
      });

      const drawer = screen.getByRole('dialog', { name: /Navigation drawer/i });
      expect(drawer).toBeTruthy();

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(screen.queryByRole('dialog', { name: /Navigation drawer/i })).toBeNull();
    });
  });

  describe('5. Add Product Wizard Navigation, Validation & Payload Contract', () => {
    it('blocks Next when required fields are missing, preserves values going back, and submits exact fields', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(true);

      render(
        <MemoryRouter>
          <ProductForm onSubmit={mockSubmit} isLoading={false} />
        </MemoryRouter>
      );

      // Step 1: Photo (optional) -> Click Next
      const nextBtn = screen.getByRole('button', { name: /next/i });
      act(() => {
        fireEvent.click(nextBtn);
      });

      // Step 2: What are you selling? -> Clicking Next without name and category should block
      act(() => {
        fireEvent.click(nextBtn);
      });
      expect(screen.getByText(/Please enter what you are selling/i)).toBeTruthy();

      // Enter produce name
      const nameInput = screen.getByPlaceholderText(/e\.g\. Fresh Red Tomatoes/i);
      act(() => {
        fireEvent.change(nameInput, { target: { value: 'Organic Tomatoes' } });
      });

      // Click category tile "Vegetables"
      await waitFor(() => {
        const vegCat = screen.getByText('Vegetables');
        expect(vegCat).toBeTruthy();
        act(() => {
          fireEvent.click(vegCat);
        });
      });

      // Now click Next -> proceeds to Step 3 (Price and quantity)
      act(() => {
        fireEvent.click(nextBtn);
      });

      expect(screen.getByText(/Price and quantity/i)).toBeTruthy();

      // Test going Back preserves name and category
      const backBtn = screen.getByRole('button', { name: /back/i });
      act(() => {
        fireEvent.click(backBtn);
      });

      expect(screen.getByDisplayValue('Organic Tomatoes')).toBeTruthy();

      // Go forward to Step 3 again
      act(() => {
        fireEvent.click(nextBtn);
      });

      // In Step 3: Enter price
      const priceInput = screen.getByRole('textbox', { name: /price/i });
      act(() => {
        fireEvent.change(priceInput, { target: { value: '45' } });
      });

      // Click Next to Step 4 (Check and publish)
      act(() => {
        fireEvent.click(nextBtn);
      });

      expect(screen.getByText(/Check and publish/i)).toBeTruthy();
      expect(screen.getByText('Organic Tomatoes')).toBeTruthy();

      // Click giant Publish button
      const publishBtn = screen.getByRole('button', { name: /Publish Produce Now/i });
      await act(async () => {
        fireEvent.click(publishBtn);
      });

      // Verify exact payload contract submitted
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      const [submittedFormData] = mockSubmit.mock.calls[0];
      expect(submittedFormData.name).toBe('Organic Tomatoes');
      expect(submittedFormData.categoryId).toBe('1');
      expect(submittedFormData.pricePerUnit).toBe('45');
      expect(submittedFormData.unit).toBe('KG');
      expect(Number(submittedFormData.quantityAvailable)).toBeGreaterThan(0);
    });
  });

  describe('6. Mandi Dashboard View Toggle & Simple View', () => {
    it('persists view choice in localStorage and renders Simple View components', async () => {
      render(
        <MemoryRouter initialEntries={['/mandi?commodity=Tomato']}>
          <MandiDashboard />
        </MemoryRouter>
      );

      // Verify simple view is default
      expect(localStorage.getItem('kisanmandi_mandi_view')).toBeNull();

      // Wait for data load
      await waitFor(() => {
        expect(screen.getByText(/Pick your crop/i)).toBeTruthy();
      });

      // Click "Detailed view" toggle
      const detailedToggle = screen.getByRole('button', { name: /Detailed view/i });
      act(() => {
        fireEvent.click(detailedToggle);
      });

      // Expect persistence
      expect(localStorage.getItem('kisanmandi_mandi_view')).toBe('detailed');

      // Click "Simple view" toggle
      const simpleToggle = screen.getByRole('button', { name: /Simple view/i });
      act(() => {
        fireEvent.click(simpleToggle);
      });

      expect(localStorage.getItem('kisanmandi_mandi_view')).toBe('simple');

      // Verify Simple View displays today's price, lowest & highest, top markets
      await waitFor(() => {
        expect(screen.getByText(/Lowest Price Today/i)).toBeTruthy();
        expect(screen.getByText(/Highest Price Today/i)).toBeTruthy();
        expect(screen.getByText(/Best Markets Today/i)).toBeTruthy();
      });
    });
  });
});
