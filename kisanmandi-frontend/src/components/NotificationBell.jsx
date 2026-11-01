import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Check,
  Package,
  CheckCircle,
  XCircle,
  CreditCard,
  Truck,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../services/notificationService';

export default function NotificationBell() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchCount = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Graceful error ignore
    }
  };

  const fetchRecent = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getRecentNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      fetchRecent();
    }
  }, [isOpen]);

  // Close dropdown on click outside or Esc
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkOne = async (e, n) => {
    e.stopPropagation();
    try {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // Ignore
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await markAsRead(n.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // Ignore
      }
    }
    setIsOpen(false);

    if (n.referenceId) {
      if (user?.role === 'FARMER') {
        navigate('/farmer/orders');
      } else {
        navigate(`/orders/${n.referenceId}`);
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ACCEPTED':
      case 'ORDER_PACKED':
        return <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'ORDER_OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'ORDER_DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'ORDER_CANCELLED':
      case 'ORDER_REJECTED':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'PAYMENT_SUCCESS':
      case 'ORDER_REFUNDED':
        return <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        id="navbar-notifications-btn"
        aria-label={t('nav.notifications', 'Notifications')}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="notifications-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              {t('notifications.title', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">
                {t('common.loading', 'Loading...')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">{t('notifications.empty', 'No notifications yet')}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                    !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${!n.read ? 'text-emerald-900 dark:text-emerald-200' : 'text-gray-800 dark:text-gray-200'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatTimestamp(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      title={t('notifications.markAsRead', 'Mark read')}
                      onClick={(e) => handleMarkOne(e, n)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-emerald-600 rounded"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
