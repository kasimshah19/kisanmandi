import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Inbox,
  Star,
  ShieldCheck,
  Tag,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell({ variant = 'desktop' }) {
  const { t, i18n } = useTranslation();
  let auth = {};
  try {
    auth = useAuth() || {};
  } catch {
    // Outside AuthProvider in test
  }
  const { user, isAuthenticated } = auth;
  const navigate = useNavigate();

  const {
    unreadCount,
    recentNotifications,
    loading,
    fetchRecent,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecent();
    }
  }, [isOpen, fetchRecent]);

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
    await markAsRead(n.id);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await markAsRead(n.id);
    }
    setIsOpen(false);

    if (n.link) {
      navigate(n.link);
    } else if (n.referenceId) {
      if (user?.role === 'FARMER') {
        navigate('/farmer/orders');
      } else {
        navigate(`/customer/orders/${n.referenceId}`);
      }
    } else {
      navigate('/notifications');
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    try {
      const lang = i18n.language || 'en';
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
      if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
      if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
      if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
      if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
    } catch {
      // Fallback
    }
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ACCEPTED':
      case 'ORDER_PACKED':
        return <Package className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'ORDER_OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'ORDER_DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />;
      case 'ORDER_CANCELLED':
      case 'ORDER_REJECTED':
        return <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
      case 'REVIEW_CREATED':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />;
      case 'FARMER_APPROVED':
        return <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />;
      case 'FARMER_REJECTED':
      case 'PRODUCT_HIDDEN':
        return <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'PRODUCT_RESTORED':
        return <Tag className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'LOW_STOCK':
        return <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-neutral-500 shrink-0" />;
    }
  };

  const getNotificationText = (n) => {
    let params = {};
    if (n.paramsJson) {
      try {
        params = JSON.parse(n.paramsJson);
      } catch {
        params = {};
      }
    }

    const title = n.titleKey
      ? t(n.titleKey, { ...params, defaultValue: n.title || n.fallbackText || 'Notification' })
      : n.title || n.fallbackText || 'Notification';

    const body = n.bodyKey
      ? t(n.bodyKey, { ...params, defaultValue: n.message || n.fallbackText || '' })
      : n.message || n.fallbackText || '';

    return { title, body };
  };

  if (!isAuthenticated) return null;

  const displayBadgeCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {variant === 'mobile' ? (
        <button
          type="button"
          onClick={handleToggle}
          aria-label={t('nav.notifications', 'Notifications')}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 font-medium text-sm transition"
        >
          <span className="flex items-center gap-3">
            <Bell size={20} className="text-neutral-500" />
            <span>{t('nav.notifications', 'Notifications')}</span>
          </span>
          {unreadCount > 0 && (
            <span
              data-testid="notification-badge"
              className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
            >
              {displayBadgeCount}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          id="navbar-notifications-btn"
          aria-label={t('nav.notifications', 'Notifications')}
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={handleToggle}
          className="relative p-2 text-neutral-600 hover:text-emerald-700 rounded-full hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              data-testid="notification-badge"
              className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold leading-none text-white bg-red-600 rounded-full shadow-xs"
            >
              {displayBadgeCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          data-testid="notifications-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-neutral-200/80 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-800 text-sm">
                {t('notifications.title', 'Notifications')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-bold bg-brand-100 text-brand-800 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs text-brand-700 hover:text-brand-800 hover:underline flex items-center gap-1 font-semibold"
              >
                <Check className="w-3.5 h-3.5" />
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
            )}
          </div>

          <div className="max-h-84 overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                {t('common.loading', 'Loading...')}
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 flex flex-col items-center gap-2">
                <Inbox className="w-8 h-8 text-neutral-300" />
                <p className="text-sm font-medium">{t('notifications.empty', 'No notifications yet')}</p>
              </div>
            ) : (
              recentNotifications.slice(0, 8).map((n) => {
                const { title, body } = getNotificationText(n);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-neutral-50 transition-colors ${
                      !n.read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs font-bold truncate ${!n.read ? 'text-emerald-950 font-semibold' : 'text-neutral-800'}`}>
                          {title}
                        </p>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {body}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        title={t('notifications.markAsRead', 'Mark read')}
                        onClick={(e) => handleMarkOne(e, n)}
                        className="p-1 text-neutral-400 hover:text-emerald-600 rounded shrink-0"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-brand-700 hover:text-brand-800 font-bold flex items-center gap-1 hover:underline"
            >
              <span>{t('notifications.seeAll', 'See all notifications')}</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
