import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Check,
  Trash2,
  Filter,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Star,
  ShieldCheck,
  AlertCircle,
  Tag,
  ExternalLink,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  getNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification
} from '../../services/notificationService';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(`${t('notifications.title', 'Notifications')} | KisanMandi`);

  let auth = {};
  try {
    auth = useAuth() || {};
  } catch {
    // Test env
  }
  const { user, isAuthenticated } = auth;
  const { refreshCount } = useNotifications();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(page, 15, unreadOnly);
      setNotifications(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleMarkOne = async (e, n) => {
    e.stopPropagation();
    try {
      await apiMarkAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true, readAt: new Date().toISOString() } : item))
      );
      refreshCount();
    } catch {
      toast.error(t('common.error', 'Something went wrong'));
    }
  };

  const handleMarkAll = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true, readAt: new Date().toISOString() }))
      );
      refreshCount();
      toast.success(t('notifications.allMarkedRead', 'All notifications marked as read'));
    } catch {
      toast.error(t('common.error', 'Something went wrong'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await apiDeleteNotification(deleteId);
      setNotifications((prev) => prev.filter((item) => item.id !== deleteId));
      refreshCount();
      toast.success(t('notifications.deleted', 'Notification deleted'));
    } catch {
      toast.error(t('common.error', 'Something went wrong'));
    } finally {
      setDeleteId(null);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await apiMarkAsRead(n.id);
        refreshCount();
      } catch {
        // Ignore
      }
    }

    if (n.link) {
      navigate(n.link);
    } else if (n.referenceId) {
      if (user?.role === 'FARMER') {
        navigate('/farmer/orders');
      } else {
        navigate(`/customer/orders/${n.referenceId}`);
      }
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
        return <Bell className="w-5 h-5 text-neutral-500 shrink-0" />;
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

  const content = (
    <div className="space-y-6">
      {/* Header with Title & Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {t('notifications.title', 'Notifications')}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {t('notifications.subtitle', 'Track your orders, updates, and account activity')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Unread Filter Toggle */}
          <Button
            variant={unreadOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setUnreadOnly(!unreadOnly);
              setPage(0);
            }}
            className="flex items-center gap-1.5"
          >
            <Filter size={14} />
            <span>{unreadOnly ? t('notifications.showAll', 'Show All') : t('notifications.unreadOnly', 'Unread only')}</span>
          </Button>

          {/* Mark All Read */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
          >
            <Check size={14} />
            <span>{t('notifications.markAllRead', 'Mark all read')}</span>
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-neutral-200 bg-white animate-pulse flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="h-3 bg-neutral-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={unreadOnly ? t('notifications.empty_unread', 'No unread notifications') : t('notifications.empty', 'No notifications yet')}
          message={t('notifications.empty_desc', 'You are all caught up! New order updates and notifications will appear here.')}
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const { title, body } = getNotificationText(n);
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  !n.read
                    ? 'bg-emerald-50/50 border-emerald-200/80 shadow-2xs'
                    : 'bg-white border-neutral-200/80 hover:bg-neutral-50/80'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`text-sm font-bold truncate ${!n.read ? 'text-emerald-950 font-semibold' : 'text-neutral-900'}`}>
                        {title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      )}
                      <span className="text-xs text-neutral-400">
                        • {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {body}
                    </p>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-700 font-semibold mt-2 hover:underline">
                        <span>{t('notifications.viewDetails', 'View details')}</span>
                        <ExternalLink size={12} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {!n.read && (
                    <button
                      type="button"
                      title={t('notifications.markAsRead', 'Mark read')}
                      onClick={(e) => handleMarkOne(e, n)}
                      className="p-2 text-neutral-400 hover:text-brand-700 rounded-lg hover:bg-neutral-100 transition"
                      aria-label={t('notifications.markAsRead', 'Mark read')}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    title={t('notifications.delete', 'Delete notification')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(n.id);
                    }}
                    className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    aria-label={t('notifications.delete', 'Delete notification')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('notifications.delete_confirm_title', 'Delete Notification')}
        message={t('notifications.delete_confirm_desc', 'Are you sure you want to delete this notification?')}
        confirmLabel={t('common.delete', 'Delete')}
        variant="danger"
      />
    </div>
  );

  // If farmer or admin, wrap in DashboardLayout; else use standard container
  if (user?.role === 'FARMER' || user?.role === 'ADMIN') {
    return <DashboardLayout role={user.role}>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">{content}</div>
    </div>
  );
}
