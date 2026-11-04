import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import Checkout from '../pages/customer/Checkout';
import * as notificationService from '../services/notificationService';
import * as configService from '../services/configService';
import * as paymentService from '../services/paymentService';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import { addressService } from '../services/addressService';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { NotificationProvider } from '../context/NotificationContext';
import '../i18n';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

const mockAuth = {
  user: { id: 1, name: 'Ramesh Patel', email: 'ramesh@example.com', role: 'CUSTOMER', phone: '9876543210' },
  isAuthenticated: true,
  logout: vi.fn(),
};

const mockCartContext = {
  cartCount: 2,
  refreshCart: vi.fn(),
};

describe('Online Payments & In-App Notifications Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NotificationBell Component', () => {
    it('renders notification bell and shows unread badge when unreadCount > 0', async () => {
      vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue({ unreadCount: 3 });

      render(
        <AuthContext.Provider value={mockAuth}>
          <NotificationProvider>
            <MemoryRouter>
              <NotificationBell />
            </MemoryRouter>
          </NotificationProvider>
        </AuthContext.Provider>
      );

      const bellBtn = screen.getByRole('button', { name: /notifications/i });
      expect(bellBtn).toBeTruthy();

      await waitFor(() => {
        const badge = screen.getByTestId('notification-badge');
        expect(badge.textContent).toBe('3');
      });
    });

    it('opens notification dropdown on click and displays notification items', async () => {
      vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue({ unreadCount: 1 });
      vi.spyOn(notificationService, 'getRecentNotifications').mockResolvedValue([
        {
          id: 101,
          title: 'Order Placed',
          message: 'Your order #55 was placed successfully.',
          fallbackText: 'Your order #55 was placed successfully.',
          type: 'ORDER_PLACED',
          referenceId: '55',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]);

      render(
        <AuthContext.Provider value={mockAuth}>
          <NotificationProvider>
            <MemoryRouter>
              <NotificationBell />
            </MemoryRouter>
          </NotificationProvider>
        </AuthContext.Provider>
      );

      const bellBtn = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellBtn);

      await waitFor(() => {
        expect(screen.getByTestId('notifications-dropdown')).toBeTruthy();
        expect(screen.getByText('Order Placed')).toBeTruthy();
        expect(screen.getByText(/Your order #55 was placed/i)).toBeTruthy();
      });
    });

    it('marks all notifications as read when clicking mark all read button', async () => {
      vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue({ unreadCount: 2 });
      vi.spyOn(notificationService, 'getRecentNotifications').mockResolvedValue([
        { id: 1, title: 'Alert 1', message: 'Msg 1', fallbackText: 'Msg 1', type: 'INFO', read: false },
        { id: 2, title: 'Alert 2', message: 'Msg 2', fallbackText: 'Msg 2', type: 'INFO', read: false },
      ]);
      vi.spyOn(notificationService, 'markAllAsRead').mockResolvedValue({});

      render(
        <AuthContext.Provider value={mockAuth}>
          <NotificationProvider>
            <MemoryRouter>
              <NotificationBell />
            </MemoryRouter>
          </NotificationProvider>
        </AuthContext.Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

      await waitFor(() => {
        expect(screen.getByText(/mark all read/i)).toBeTruthy();
      });

      fireEvent.click(screen.getByText(/mark all read/i));

      await waitFor(() => {
        expect(notificationService.markAllAsRead).toHaveBeenCalled();
        expect(screen.queryByTestId('notification-badge')).toBeNull();
      });
    });
  });

  describe('Checkout with Payment Modes', () => {
    const mockCart = {
      items: [
        {
          id: 1,
          productId: 10,
          productName: 'Fresh Tomato',
          productImage: 'https://example.com/tomato.jpg',
          quantity: 2,
          unit: 'KG',
          pricePerUnit: 40,
          lineTotal: 80,
          available: true,
        },
      ],
      totalAmount: 80,
    };

    const mockAddresses = [
      {
        id: 1,
        fullName: 'Ramesh Patel',
        phone: '9876543210',
        line1: 'Farm Road 4',
        city: 'Nashik',
        state: 'Maharashtra',
        pincode: '422003',
        defaultAddress: true,
      },
    ];

    it('displays Online Payment option when payment is enabled in public config', async () => {
      vi.spyOn(cartService, 'get').mockResolvedValueOnce({ data: mockCart });
      vi.spyOn(addressService, 'getAll').mockResolvedValueOnce({ data: mockAddresses });
      vi.spyOn(configService, 'getPublicConfig').mockResolvedValueOnce({
        paymentEnabled: true,
        razorpayKeyId: 'rzp_test_mockkey123',
      });

      render(
        <AuthContext.Provider value={mockAuth}>
          <CartContext.Provider value={mockCartContext}>
            <MemoryRouter>
              <Checkout />
            </MemoryRouter>
          </CartContext.Provider>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/pay cash when you receive/i)).toBeTruthy();
        expect(screen.getByText(/online payment/i)).toBeTruthy();
      });
    });

    it('hides Online Payment option when paymentEnabled is false (graceful degradation)', async () => {
      vi.spyOn(cartService, 'get').mockResolvedValueOnce({ data: mockCart });
      vi.spyOn(addressService, 'getAll').mockResolvedValueOnce({ data: mockAddresses });
      vi.spyOn(configService, 'getPublicConfig').mockResolvedValueOnce({
        paymentEnabled: false,
        razorpayKeyId: '',
      });

      render(
        <AuthContext.Provider value={mockAuth}>
          <CartContext.Provider value={mockCartContext}>
            <MemoryRouter>
              <Checkout />
            </MemoryRouter>
          </CartContext.Provider>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/pay cash when you receive/i)).toBeTruthy();
        expect(screen.queryByText(/online payment/i)).toBeNull();
      });
    });
  });
});
