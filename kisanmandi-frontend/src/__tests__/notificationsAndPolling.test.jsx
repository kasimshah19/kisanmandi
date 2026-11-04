import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import usePolling from '../hooks/usePolling';
import { NotificationProvider } from '../context/NotificationContext';
import Notifications from '../pages/account/Notifications';
import * as notificationService from '../services/notificationService';
import { AuthContext } from '../context/AuthContext';
import '../i18n';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

const mockCustomerAuth = {
  user: { id: 10, name: 'Kisan Customer', email: 'customer@kisan.com', role: 'CUSTOMER' },
  isAuthenticated: true,
  logout: vi.fn(),
};

describe('Notifications & Adaptive Polling Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('usePolling Hook', () => {
    it('executes callback periodically when enabled and tab is visible', async () => {
      const callback = vi.fn().mockResolvedValue(true);

      const { unmount } = renderHook(() =>
        usePolling(callback, {
          intervalMs: 1000,
          enabled: true,
          whenVisible: true,
          immediate: false,
        })
      );

      expect(callback).not.toHaveBeenCalled();

      // Advance by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Advance by another 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(callback).toHaveBeenCalledTimes(2);

      unmount();
    });

    it('pauses polling when document is hidden', async () => {
      const callback = vi.fn().mockResolvedValue(true);

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });

      const { unmount } = renderHook(() =>
        usePolling(callback, {
          intervalMs: 1000,
          enabled: true,
          whenVisible: true,
          immediate: false,
        })
      );

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(callback).not.toHaveBeenCalled();

      // Restore visible
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      });

      unmount();
    });

    it('backs off exponentially on consecutive errors when backoff is enabled', async () => {
      const callback = vi.fn().mockRejectedValue(new Error('Network error'));

      const { unmount } = renderHook(() =>
        usePolling(callback, {
          intervalMs: 1000,
          enabled: true,
          backoff: true,
          maxIntervalMs: 8000,
          immediate: false,
        })
      );

      // First tick at 1000ms
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Since it failed, next delay is 2000ms. Advancing by 1000ms should NOT trigger
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Advancing another 1000ms (total 2000ms) triggers 2nd tick
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(callback).toHaveBeenCalledTimes(2);

      unmount();
    });
  });

  describe('Notifications Page Component', () => {
    it('renders notification list and allows filtering by unread', async () => {
      vi.useRealTimers();

      const mockList = [
        {
          id: 1,
          type: 'ORDER_PLACED',
          titleKey: 'notifications.order_placed.title',
          bodyKey: 'notifications.order_placed.body',
          paramsJson: JSON.stringify({ orderId: 101, customerName: 'Ramesh', amount: 500 }),
          fallbackText: 'New order #101 received',
          link: '/customer/orders/101',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'ORDER_DELIVERED',
          titleKey: 'notifications.order_delivered.title',
          bodyKey: 'notifications.order_delivered.body',
          paramsJson: JSON.stringify({ orderId: 99 }),
          fallbackText: 'Order #99 delivered',
          link: '/customer/orders/99',
          readAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];

      vi.spyOn(notificationService, 'getNotifications').mockResolvedValue({
        content: mockList,
        totalPages: 1,
        totalElements: 2,
      });
      vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue({ unreadCount: 1 });

      render(
        <AuthContext.Provider value={mockCustomerAuth}>
          <NotificationProvider>
            <MemoryRouter>
              <Notifications />
            </MemoryRouter>
          </NotificationProvider>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/New Order Placed/i)).toBeTruthy();
      });

      // Filter toggle to unread only
      const unreadToggle = screen.getByText(/Unread only/i);
      fireEvent.click(unreadToggle);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalledWith(0, 15, true);
      });
    });
  });
});
