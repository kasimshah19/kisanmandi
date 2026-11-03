import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import { forgotPassword } from '../../services/authService';
import { getPublicConfig } from '../../services/configService';

export default function ForgotPassword() {
  const { t } = useTranslation();
  useDocumentTitle('Forgot Password | KisanMandi');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Check public config on mount
  useEffect(() => {
    let isMounted = true;
    getPublicConfig()
      .then((cfg) => {
        if (isMounted && cfg && typeof cfg.emailEnabled === 'boolean') {
          setEmailEnabled(cfg.emailEnabled);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error(t('errors.field_required', 'Please fill in all required fields'));
      return;
    }
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
      setCooldown(60);
      toast.success(t('auth.forgot_password_success_toast', 'Reset instructions sent if email exists'));
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfterSeconds || 60;
        setCooldown(retryAfter);
        const msg = error.response.data?.message || t('errors.rate_limit', 'Too many requests. Please wait.');
        toast.error(msg);
      } else {
        // Never enumerate email: treat errors identically
        setSubmitted(true);
        setCooldown(60);
        toast.success(t('auth.forgot_password_success_toast', 'Reset instructions sent if email exists'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-stone-200/90 overflow-hidden p-6 sm:p-8">
        <div className="pb-4 mb-5 border-b border-stone-100 flex items-center justify-between gap-2 flex-wrap">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft size={14} />
            <span>{t('auth.back_to_login', 'Back to login')}</span>
          </Link>
          <LanguageSwitcher variant="segmented" />
        </div>

        {!emailEnabled ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.email_disabled_title', 'Password Reset Unavailable')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.email_disabled_desc',
                'Password reset by email is not available right now. Please contact your administrator or support.'
              )}
            </p>
            <div className="pt-3">
              <Link to="/login">
                <Button variant="primary" fullWidth className="min-h-[48px]">
                  {t('auth.back_to_login', 'Back to login')}
                </Button>
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.check_inbox_title', 'Check your inbox')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.check_inbox_desc',
                'If an account exists for this email, we have sent instructions to reset your password. The link will expire in 30 minutes.'
              )}
            </p>
            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                fullWidth
                disabled={isLoading || cooldown > 0}
                onClick={() => handleSubmit()}
                className="min-h-[48px]"
              >
                {cooldown > 0
                  ? `${t('auth.resend_link', 'Resend reset link')} (${cooldown}s)`
                  : t('auth.resend_link', 'Resend reset link')}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setSubmitted(false);
                  setCooldown(0);
                }}
                className="min-h-[44px]"
              >
                {t('auth.try_another_email', 'Try another email')}
              </Button>
              <Link
                to="/login"
                className="block text-center text-sm font-semibold text-green-800 hover:text-green-900 hover:underline pt-2"
              >
                {t('auth.back_to_login', 'Back to login')}
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center mb-4 shadow-2xs">
                <Mail size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {t('auth.forgot_password_title', 'Forgot password?')}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                {t(
                  'auth.forgot_password_subtitle',
                  "No worries, we'll send you reset instructions. Enter your registered account email."
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                id="reset-email"
                label={t('auth.email_label', 'Email Address')}
                required
              >
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-14 min-h-[56px] text-base"
                  required
                />
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="xl"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading || !email.trim() || cooldown > 0}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[56px] text-base font-bold"
                >
                  {isLoading
                    ? t('common.loading', 'Please wait...')
                    : cooldown > 0
                    ? `${t('auth.send_reset_link', 'Send reset link')} (${cooldown}s)`
                    : t('auth.send_reset_link', 'Send reset link')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
