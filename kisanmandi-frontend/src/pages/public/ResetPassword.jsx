import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import PasswordPolicyChecklist, { checkPasswordRules } from '../../components/PasswordPolicyChecklist';
import { resetPassword } from '../../services/authService';

export default function ResetPassword() {
  const { t } = useTranslation();
  useDocumentTitle('Reset Password | KisanMandi');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getInitialToken = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const match = hash.match(/token=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return searchParams.get('token') || '';
  };

  const [token, setToken] = useState(getInitialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  // Read token from location.hash (#token=...) or query param, strip from URL, set referrer meta
  useEffect(() => {
    // 1. Set <meta name="referrer" content="no-referrer"> to protect token
    let meta = document.querySelector('meta[name="referrer"]');
    const prevReferrer = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'referrer';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'no-referrer');

    // 2. Immediately strip token from URL so it does not leak into browser history or logs
    if (token && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    return () => {
      if (prevReferrer) {
        meta.setAttribute('content', prevReferrer);
      } else if (meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      }
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('auth.invalid_or_missing_token', 'Invalid or missing reset token'));
      return;
    }

    const rules = checkPasswordRules(password, '');
    if (!rules.allPassed) {
      if (!rules.minLength) {
        toast.error(t('auth.policy_length', '8 to 72 characters long'));
      } else if (!rules.hasLetter) {
        toast.error(t('auth.policy_letter', 'At least one letter (a-z, A-Z)'));
      } else if (!rules.hasDigit) {
        toast.error(t('auth.policy_digit', 'At least one digit (0-9)'));
      } else if (!rules.notCommon) {
        toast.error(t('auth.policy_not_common', 'Not an easily guessable password'));
      } else {
        toast.error(t('auth.password_policy_fail', 'Password does not meet requirements'));
      }
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwords_do_not_match', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      toast.success(t('auth.reset_password_success', 'Password reset successfully!'));
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout', 'Failed to connect. Please try again.');
      toast.error(msg);
      if (error.response?.status === 400 && msg.toLowerCase().includes('expired')) {
        setTokenError(true);
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
            <span>&larr;</span>
            <span>{t('auth.back_to_login', 'Back to login')}</span>
          </Link>
          <LanguageSwitcher variant="segmented" />
        </div>

        {!token || tokenError ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.invalid_link_title', 'Invalid or expired link')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.invalid_link_desc',
                'This password reset link is invalid or has already been used. Please request a new one.'
              )}
            </p>
            <div className="pt-2">
              <Link to="/forgot-password">
                <Button variant="primary" fullWidth className="min-h-[48px]">
                  {t('auth.request_new_link', 'Request a new reset link')}
                </Button>
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.password_updated_title', 'Password updated!')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.password_updated_desc',
                'Your password has been changed successfully. You can now log in with your new credentials.'
              )}
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight size={18} />}
                className="min-h-[48px]"
              >
                {t('auth.proceed_to_login', 'Proceed to Login')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center mb-4 shadow-2xs">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {t('auth.set_new_password_title', 'Set new password')}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                {t(
                  'auth.set_new_password_subtitle',
                  'Choose a strong, memorable password that is at least 8 characters long.'
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                id="reset-new-password"
                label={t('auth.new_password_label', 'New Password')}
                required
              >
                <div className="relative">
                  <Input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-14 min-h-[56px] text-base pr-24"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg min-h-[38px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showPassword ? t('auth.hide_pwd', 'Hide') : t('auth.show_pwd', 'Show')}</span>
                  </button>
                </div>
              </FormField>

              {/* Password Policy Checklist */}
              {password && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <PasswordPolicyChecklist password={password} email="" />
                </div>
              )}

              <FormField
                id="reset-confirm-password"
                label={t('auth.confirm_new_password_label', 'Confirm New Password')}
                required
              >
                <Input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
                  disabled={isLoading || !password || !confirmPassword}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[56px] text-base font-bold"
                >
                  {isLoading
                    ? t('common.loading', 'Please wait...')
                    : t('auth.update_password_btn', 'Update Password')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
