import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import {
  getUnreadCount,
  getRecentNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification
} from '../services/notificationService';
import usePolling from '../hooks/usePolling';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { t } = useTranslation();
  let authContext = {};
  try {
    authContext = useAuth() || {};
  } catch {
    // In test environments or outside AuthProvider
  }
  const { isAuthenticated, user } = authContext;

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFirstPollRef = useRef(true);
  const prevCountRef = useRef(0);

  // Reset state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setRecentNotifications([]);
      isFirstPollRef.current = true;
      prevCountRef.current = 0;
    }
  }, [isAuthenticated, user?.id]);

  // Polling fetch callback
  const pollUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getUnreadCount();
      const newCount = typeof data?.unreadCount === 'number' ? data.unreadCount : 0;

      // Notify only when count increases after the initial fetch
      if (!isFirstPollRef.current && newCount > prevCountRef.current) {
        toast(t('notifications.newNotificationToast', 'You have a new notification'), {
          id: 'new-notification-toast',
          icon: '🔔',
          duration: 4000,
        });
      }

      isFirstPollRef.current = false;
      prevCountRef.current = newCount;
      setUnreadCount(newCount);
    } catch {
      // Tolerate background polling errors silently without spamming error toasts
      throw new Error('Notification count poll failed');
    }
  }, [isAuthenticated, t]);

  // 30s adaptive polling (tab visible, backoff up to 5min)
  const { trigger: refreshCount } = usePolling(pollUnreadCount, {
    intervalMs: 30000,
    whenVisible: true,
    backoff: true,
    maxIntervalMs: 300000,
    enabled: !!isAuthenticated,
    immediate: true,
  });

  const fetchRecent = useCallback(async () => {
    if (!isAuthenticated) return [];
    setLoading(true);
    try {
      const data = await getRecentNotifications();
      const list = Array.isArray(data) ? data : [];
      setRecentNotifications(list);
      return list;
    } catch {
      setRecentNotifications([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id) => {
    try {
      await apiMarkAsRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      // Graceful error ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setUnreadCount(0);
      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      // Graceful error ignore
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await apiDeleteNotification(id);
      setRecentNotifications((prev) => prev.filter((n) => n.id !== id));
      refreshCount();
    } catch (err) {
      // Graceful error ignore
    }
  }, [refreshCount]);

  const value = {
    unreadCount,
    recentNotifications,
    loading,
    refreshCount,
    fetchRecent,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      unreadCount: 0,
      recentNotifications: [],
      loading: false,
      refreshCount: () => {},
      fetchRecent: async () => [],
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
    };
  }
  return context;
}

export default NotificationContext;
