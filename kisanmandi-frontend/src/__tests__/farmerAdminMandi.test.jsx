import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { CustomChartTooltip } from '../components/charts/chartTheme';
import { computeOnboardingStep } from '../pages/farmer/FarmerDashboard';
import DashboardLayout from '../components/DashboardLayout';
import * as AuthContextModule from '../context/AuthContext';
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

describe('Farmer, Admin & Mandi (Part 3) Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('4. DashboardLayout Mobile Drawer Open and Close with Escape', () => {
    it('opens mobile drawer when hamburger button is clicked and closes on Escape key', async () => {
      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <DashboardLayout role="FARMER">
            <div data-testid="dashboard-content">Farmer Content Area</div>
          </DashboardLayout>
        </MemoryRouter>
      );

      // Initially drawer is not visible
      expect(screen.queryByRole('dialog', { name: /Navigation drawer/i })).toBeNull();

      // Find the mobile hamburger button
      const openButton = screen.getByRole('button', { name: /Open sidebar menu/i });
      expect(openButton).toBeTruthy();

      // Click to open drawer
      act(() => {
        fireEvent.click(openButton);
      });

      // Drawer dialog should now be in the DOM
      const drawer = screen.getByRole('dialog', { name: /Navigation drawer/i });
      expect(drawer).toBeTruthy();

      // Press Escape key
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      // Drawer should now be closed
      expect(screen.queryByRole('dialog', { name: /Navigation drawer/i })).toBeNull();
    });
  });
});
