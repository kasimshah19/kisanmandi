import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, AlertCircle, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../services/authService';

export default function EmailVerificationBanner() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Don't show if not logged in, or already verified, or user dismissed for this page session
  if (!isAuthenticated || !user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await resendVerification();
      toast.success(t('auth.resend_verification_success', 'Verification link sent to your email.'));
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout', 'Failed to send verification email. Please try again.');
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Email verification notice"
      className="bg-amber-500/10 border-b border-amber-500/20 text-amber-950 px-4 py-2.5 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={16} className="text-amber-700 shrink-0" />
          <span className="truncate">
            <strong className="font-semibold">{t('auth.unverified_banner_title', 'Email unverified')}:</strong>{' '}
            <span className="hidden sm:inline">
              {t('auth.unverified_banner_desc', 'Please verify your email address to secure your account.')}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSending}
            onClick={handleResend}
            className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>{t('common.loading', 'Sending...')}</span>
              </>
            ) : (
              <span>{t('auth.resend_email_btn', 'Resend Link')}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-amber-800 hover:text-amber-950 rounded hover:bg-amber-500/10 transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
