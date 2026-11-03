import React, { useEffect, useState, useRef } from 'react';
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

  const [token, setToken] = useState('');
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'no_token'
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // StrictMode single-call guard to prevent double verification
  const executedRef = useRef(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Read token from location.hash (#token=...) or query param and strip from URL
  useEffect(() => {
    let extractedToken = '';
    const hash = window.location.hash || '';
    const match = hash.match(/token=([^&]+)/);
    if (match) {
      extractedToken = decodeURIComponent(match[1]);
    } else {
      extractedToken = searchParams.get('token') || '';
    }

    if (extractedToken) {
      setToken(extractedToken);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      setStatus('no_token');
    }
  }, []);

  // Execute verification once token is resolved
  useEffect(() => {
    if (!token) return;
    if (executedRef.current) return;
    executedRef.current = true;

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
    if (cooldown > 0) return;
    setIsResending(true);
    try {
      await resendVerification();
      setCooldown(60);
      toast.success(t('auth.resend_verification_success', 'A new verification link has been sent to your email.'));
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfterSeconds || 60;
        setCooldown(retryAfter);
        const msg = error.response.data?.message || t('errors.rate_limit', 'Too many requests. Please wait.');
        toast.error(msg);
      } else {
        const msg =
          error.friendlyMessage ||
          error.response?.data?.message ||
          t('errors.server_timeout', 'Failed to connect. Please try again.');
        toast.error(msg);
      }
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
                  disabled={isResending || cooldown > 0}
                  onClick={handleResend}
                  className="min-h-[50px] font-bold"
                >
                  {cooldown > 0
                    ? `${t('auth.resend_email_btn', 'Resend Link')} (${cooldown}s)`
                    : t('auth.resend_email_btn', 'Resend Link')}
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="primary" fullWidth className="min-h-[50px] font-bold">
                    {t('auth.back_to_login', 'Back to login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {status === 'no_token' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
              <Mail size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('auth.no_token_title', 'Check your email')}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t(
                'auth.no_token_desc',
                'Please click the verification link sent to your registered email address to verify your account.'
              )}
            </p>
            <div className="pt-4">
              <Link to="/">
                <Button variant="outline" fullWidth className="min-h-[50px]">
                  {t('nav.home', 'Back to Home')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
