import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import { Leaf, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';

export default function Login() {
  const { t } = useTranslation();
  useDocumentTitle('Login | KisanMandi');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error(t('errors.field_required'));
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(form);
      toast.success(`${t('common.continue')}, ${data.name}!`);
      navigate(resolveTarget(data.role), { replace: true });
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-card border border-neutral-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Panel (visible on lg) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b] text-white p-10 flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white font-extrabold text-2xl tracking-tight">
              <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-5 h-5" />
              </span>
              <span>KisanMandi</span>
            </Link>

            <p className="text-green-100/80 text-sm leading-relaxed">
              {t('auth.brand_tagline')}
            </p>

            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.buyer_benefit_1')}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.buyer_benefit_2')}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.buyer_benefit_3')}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-green-800/60 text-xs text-green-200/70">
            &copy; {new Date().getFullYear()} KisanMandi
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Bar: Language switcher visible without scroll at 360px */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-100">
              {/* Mobile-only compact brand logo */}
              <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-neutral-900 font-extrabold text-lg">
                <span className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4" />
                </span>
                <span>KisanMandi</span>
              </Link>
              <div className="ml-auto">
                <LanguageSwitcher variant="segmented" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {t('auth.login_title')}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {t('auth.login_subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                id="login-email"
                label={t('auth.email_label')}
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
                  required
                />
              </FormField>

              <FormField
                id="login-password"
                label={t('auth.password_label')}
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
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading || !form.email || !form.password}
                  rightIcon={<ArrowRight size={18} />}
                >
                  {isLoading ? t('auth.logging_in') : t('auth.sign_in_btn')}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Link to Register */}
          <div className="pt-6 mt-6 border-t border-neutral-100 text-center text-sm text-neutral-600">
            <span>{t('auth.dont_have_account')} </span>
            <Link to="/register" className="font-bold text-brand-700 hover:text-brand-800 hover:underline">
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
