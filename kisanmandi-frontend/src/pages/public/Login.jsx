import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import { Leaf, Eye, EyeOff, Check, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import HeroFarmScene from '../../components/illustrations/HeroFarmScene';

// WARNING: Any environment variable prefixed with VITE_* is bundled into the client build and publicly inspectable in the browser.
// Only use public, non-sensitive demo accounts here. Never add admin or production credentials!
const DEMO_CUSTOMER_EMAIL = import.meta.env.VITE_DEMO_CUSTOMER_EMAIL || '';
const DEMO_CUSTOMER_PASSWORD = import.meta.env.VITE_DEMO_CUSTOMER_PASSWORD || '';
const DEMO_FARMER_EMAIL = import.meta.env.VITE_DEMO_FARMER_EMAIL || '';
const DEMO_FARMER_PASSWORD = import.meta.env.VITE_DEMO_FARMER_PASSWORD || '';

const HAS_CUSTOMER_DEMO = Boolean(DEMO_CUSTOMER_EMAIL && DEMO_CUSTOMER_PASSWORD);
const HAS_FARMER_DEMO = Boolean(DEMO_FARMER_EMAIL && DEMO_FARMER_PASSWORD);
const HAS_ANY_DEMO = HAS_CUSTOMER_DEMO || HAS_FARMER_DEMO;

export default function Login() {
  const { t } = useTranslation();
  useDocumentTitle('Login | KisanMandi');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.prefillEmail || '',
    password: location.state?.prefillPassword || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Safe target route resolver to prevent cross-role unauthorized loops
  const resolveTarget = (role) => {
    const rawFrom = location.state?.from;
    const defaultPath = getDashboardPath(role);
    if (!rawFrom) return defaultPath;
    const fromPath = typeof rawFrom === 'string' ? rawFrom : rawFrom.pathname || defaultPath;

    if (fromPath.startsWith('/farmer') && role !== 'ROLE_FARMER' && role !== 'FARMER') return defaultPath;
    if (fromPath.startsWith('/customer') && role !== 'ROLE_CUSTOMER' && role !== 'CUSTOMER') return defaultPath;
    if (fromPath.startsWith('/admin') && role !== 'ROLE_ADMIN' && role !== 'ADMIN') return defaultPath;
    return fromPath;
  };

  // If already logged in, redirect to target or dashboard
  if (isAuthenticated && user) {
    return <Navigate to={resolveTarget(user.role)} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = async (email, password) => {
    setForm({ email, password });
    setIsLoading(true);
    try {
      const data = await login({ email, password });
      toast.success(`${t('common.continue', 'Welcome back')}, ${data.name}!`);
      navigate(resolveTarget(data.role), { replace: true });
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout', 'Failed to connect. Please try again.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error(t('errors.field_required', 'Please fill in all required fields'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(form);
      toast.success(`${t('common.continue', 'Welcome back')}, ${data.name}!`);
      navigate(resolveTarget(data.role), { replace: true });
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout', 'Failed to connect. Please try again.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-card border border-stone-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Panel: On lg full height, on mobile a compact top header */}
        <div className="flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b] text-white p-5 sm:p-8 lg:p-10 lg:col-span-5">
          {/* Subtle decorative glow */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4 lg:space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-white font-extrabold text-xl sm:text-2xl tracking-tight"
            >
              <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-5 h-5" />
              </span>
              <span>KisanMandi</span>
            </Link>

            {/* Small HeroFarmScene on desktop */}
            <div className="hidden lg:block rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-2 my-2">
              <HeroFarmScene className="w-full h-auto max-h-[140px]" />
            </div>

            <p className="text-green-100/85 text-xs sm:text-sm leading-relaxed">
              {t(
                'auth.brand_tagline',
                'Connecting honest agricultural growers and conscious households directly with live mandi prices.'
              )}
            </p>

            {/* 3 Truthful Benefit Bullets */}
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.buyer_benefit_1', 'Direct farm produce without middleman markups')}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.buyer_benefit_2', 'Compare daily government mandi rates transparently')}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.buyer_benefit_3', '100% Cash on Delivery across Maharashtra')}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative z-10 pt-6 border-t border-green-800/60 text-xs text-green-200/70">
            &copy; {new Date().getFullYear()} KisanMandi
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Top Bar: Language Switcher Visible without Scrolling on 360px */}
            <div className="pb-4 mb-5 border-b border-stone-100 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {t('common.language', 'Language')}
              </span>
              <div className="w-full sm:w-auto">
                <LanguageSwitcher variant="segmented" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {t('auth.login_title', 'Welcome back')}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {t('auth.login_subtitle', 'Enter your registered email and password to continue.')}
              </p>
            </div>

            {/* OPTIONAL PUBLIC DEMO BUTTONS: RENDER ONLY IF VITE_DEMO_* ENV VARS ARE CONFIGURED */}
            {HAS_ANY_DEMO && (
              <div className="mb-6 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  <span>{t('auth.try_demo_title', 'Try the demo accounts')}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {HAS_CUSTOMER_DEMO && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDemoLogin(DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD)}
                      className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-stone-800 hover:bg-amber-100/60 transition shadow-2xs min-h-[40px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🛍️</span>
                      <span>{t('auth.demo_as_customer', 'Try as customer')}</span>
                    </button>
                  )}
                  {HAS_FARMER_DEMO && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDemoLogin(DEMO_FARMER_EMAIL, DEMO_FARMER_PASSWORD)}
                      className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-stone-800 hover:bg-amber-100/60 transition shadow-2xs min-h-[40px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🧑‍🌾</span>
                      <span>{t('auth.demo_as_farmer', 'Try as farmer')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                id="login-email"
                label={t('auth.email_label', 'Email Address')}
                required
              >
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-14 min-h-[56px] text-base"
                  required
                />
              </FormField>

              <FormField
                id="login-password"
                label={t('auth.password_label', 'Password')}
                required
              >
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-14 min-h-[56px] text-base pr-24"
                    required
                  />
                  {/* Show/Hide password with WORD + ICON */}
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

              <div className="pt-2">
                <Button
                  type="submit"
                  size="xl"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading || !form.email || !form.password}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[56px] text-base font-bold"
                >
                  {isLoading ? t('auth.logging_in', 'Signing in...') : t('auth.sign_in_btn', 'Login to KisanMandi')}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Link to Register */}
          <div className="pt-6 mt-6 border-t border-stone-100 text-center text-sm text-stone-600">
            <span>{t('auth.dont_have_account', "Don't have an account?")} </span>
            <Link to="/register" className="font-bold text-green-800 hover:text-green-900 underline underline-offset-2">
              {t('nav.register', 'Register here')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
