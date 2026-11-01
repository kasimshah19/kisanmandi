import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Button from '../../components/ui/Button';
import { verifyEmail, resendVerification } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmail() {
  const { t } = useTranslation();
  useDocumentTitle('Verify Email | KisanMandi');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState(token ? 'verifying' : 'no_token'); // 'verifying' | 'success' | 'error' | 'no_token'
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const verify = async () => {
      try {
        await verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          if (user) {
            updateUser({ emailVerified: true });
          }
          toast.success(t('auth.email_verified_success', 'Email verified successfully!'));
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          const msg =
            error.friendlyMessage ||
            error.response?.data?.message ||
            t('auth.verification_failed_desc', 'The verification link is invalid or has expired.');
          setErrorMessage(msg);
        }
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      toast.success(t('auth.resend_verification_success', 'A new verification link has been sent to your email.'));
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout', 'Failed to connect. Please try again.');
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-stone-200/90 overflow-hidden p-6 sm:p-8">
        <div className="pb-4 mb-5 border-b border-stone-100 flex items-center justify-between gap-2 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <span>&larr;</span>
            <span>{t('nav.home', 'Home')}</span>
          </Link>
          <LanguageSwitcher variant="segmented" />
        </div>

        {status === 'verifying' && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-green-700 animate-spin mx-auto" />
            <h1 className="text-xl font-extrabold text-stone-900">
              {t('auth.verifying_email_title', 'Verifying your email...')}
            </h1>
            <p className="text-sm text-stone-600">
              {t('auth.verifying_email_desc', 'Please wait while we confirm your email address.')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.email_verified_title', 'Email verified!')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.email_verified_desc',
                'Your email address has been successfully verified. Your account is now fully active.'
              )}
            </p>
            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(isAuthenticated ? '/' : '/login', { replace: true })}
                rightIcon={<ArrowRight size={18} />}
                className="min-h-[50px] font-bold"
              >
                {isAuthenticated
                  ? t('common.continue', 'Continue to KisanMandi')
                  : t('auth.proceed_to_login', 'Proceed to login')}
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.verification_failed_title', 'Verification failed')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {errorMessage ||
                t(
                  'auth.verification_failed_desc',
                  'The verification link is invalid or has expired. Please request a new one.'
                )}
            </p>
            <div className="pt-4 space-y-3">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  fullWidth
                  loading={isResending}
                  disabled={isResending}
                  onClick={handleResend}
                  className="min-h-[50px] font-bold"
                >
                  {t('auth.resend_verification_btn', 'Resend verification email')}
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="primary" fullWidth className="min-h-[50px] font-bold">
                    {t('auth.proceed_to_login', 'Proceed to login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {status === 'no_token' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <Mail size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.verify_your_email_title', 'Verify your email')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.verify_your_email_desc',
                'We sent a verification link to your email address when you registered. Please click that link to verify your account.'
              )}
            </p>
            {isAuthenticated && (
              <div className="pt-4">
                <Button
                  variant="primary"
                  fullWidth
                  loading={isResending}
                  disabled={isResending}
                  onClick={handleResend}
                  className="min-h-[50px] font-bold"
                >
                  {t('auth.resend_verification_btn', 'Resend verification email')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
