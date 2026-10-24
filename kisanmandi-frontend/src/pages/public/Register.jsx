import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Tractor,
  ShoppingBag,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';

export default function Register() {
  const { t } = useTranslation();
  useDocumentTitle('Register | KisanMandi');

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Preselect role from query param ?role=FARMER or ?role=CUSTOMER
  const initialRoleParam = searchParams.get('role')?.toUpperCase();
  const validInitialRole = initialRoleParam === 'FARMER' || initialRoleParam === 'CUSTOMER' ? initialRoleParam : '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: validInitialRole,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync if query param changes dynamically
  useEffect(() => {
    const qRole = searchParams.get('role')?.toUpperCase();
    if ((qRole === 'FARMER' || qRole === 'CUSTOMER') && !form.role) {
      setForm((prev) => ({ ...prev, role: qRole }));
    }
  }, [searchParams, form.role]);

  // Compute password strength hint (purely visual presentation)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    if (pwd.length < 6) return { score: 1, label: t('auth.strength_weak'), color: 'bg-red-500' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    const variety = [hasLetters, hasNumbers, hasSpecial].filter(Boolean).length;
    if (pwd.length >= 8 && variety >= 2) {
      return { score: 3, label: t('auth.strength_strong'), color: 'bg-emerald-600' };
    }
    return { score: 2, label: t('auth.strength_fair'), color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const selectRole = (role) => {
    setForm({ ...form, role });
    if (errors.role) setErrors({ ...errors, role: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('errors.field_required');
    if (!form.email.trim()) e.email = t('errors.field_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('auth.email_invalid');
    if (!form.phone.trim()) e.phone = t('errors.field_required');
    else if (!/^[0-9]{10}$/.test(form.phone)) e.phone = t('auth.phone_invalid');
    if (!form.password) e.password = t('errors.field_required');
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = t('auth.password_mismatch');
    if (!form.role) e.role = t('errors.field_required');
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      toast.success(t('auth.register_subtitle'));
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
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
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-card border border-neutral-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Brand Panel: on mobile it sits at top, on lg it sits on the left column */}
        <div className="flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b] text-white p-6 sm:p-8 lg:p-10 lg:col-span-5">
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-amber-400/10 blur-3xl rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4 lg:space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white font-extrabold text-xl sm:text-2xl tracking-tight">
              <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-5 h-5" />
              </span>
              <span>KisanMandi</span>
            </Link>

            <p className="text-green-100/80 text-xs sm:text-sm leading-relaxed">
              {t('auth.brand_tagline')}
            </p>

            <div className="pt-1 lg:pt-4 space-y-2.5 lg:space-y-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.farmer_benefit_1')}
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.farmer_benefit_2')}
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.farmer_benefit_3')}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative z-10 pt-8 border-t border-green-800/60 text-xs text-green-200/70">
            &copy; {new Date().getFullYear()} KisanMandi
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Top Bar: Language switcher */}
            <div className="pb-5 mb-5 border-b border-neutral-100 flex justify-end">
              <div className="w-full sm:w-auto">
                <LanguageSwitcher variant="segmented" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {t('auth.register_title')}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {t('auth.register_subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Role Selection Cards (Proper Radio Group with Keyboard Accessibility) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  {t('auth.select_role')} <span className="text-red-500">*</span>
                </label>
                <div
                  role="radiogroup"
                  aria-label={t('auth.select_role')}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {/* Farmer Option */}
                  <div
                    role="radio"
                    tabIndex={0}
                    aria-checked={form.role === 'FARMER'}
                    onClick={() => selectRole('FARMER')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        selectRole('FARMER');
                      }
                    }}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start gap-3 relative ${
                      form.role === 'FARMER'
                        ? 'border-brand-700 bg-green-50/60 shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Tractor size={20} />
                    </div>
                    <div className="min-w-0 pr-6">
                      <div className="font-bold text-sm text-neutral-900 leading-snug">
                        {t('auth.role_farmer_title')}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                        {t('auth.role_farmer_desc')}
                      </div>
                    </div>
                    {/* Selected Checkmark Ring */}
                    <div
                      className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        form.role === 'FARMER'
                          ? 'border-brand-700 bg-brand-700 text-white'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {form.role === 'FARMER' && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Customer Option */}
                  <div
                    role="radio"
                    tabIndex={0}
                    aria-checked={form.role === 'CUSTOMER'}
                    onClick={() => selectRole('CUSTOMER')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        selectRole('CUSTOMER');
                      }
                    }}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start gap-3 relative ${
                      form.role === 'CUSTOMER'
                        ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="min-w-0 pr-6">
                      <div className="font-bold text-sm text-neutral-900 leading-snug">
                        {t('auth.role_customer_title')}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                        {t('auth.role_customer_desc')}
                      </div>
                    </div>
                    <div
                      className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        form.role === 'CUSTOMER'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {form.role === 'CUSTOMER' && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
                {errors.role && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.role}</p>}
              </div>

              {/* Full Name */}
              <FormField
                id="reg-name"
                label={t('auth.full_name_label')}
                error={errors.name}
                required
              >
                <Input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={100}
                  placeholder="e.g. Ramesh Patel"
                  required
                />
              </FormField>

              {/* Email & Phone side by side on sm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="reg-email"
                  label={t('auth.email_label')}
                  error={errors.email}
                  required
                >
                  <Input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength={150}
                    placeholder="you@example.com"
                    required
                  />
                </FormField>

                <FormField
                  id="reg-phone"
                  label={t('auth.phone_label')}
                  error={errors.phone}
                  required
                >
                  <Input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, phone: val });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="10 digit mobile"
                    required
                  />
                </FormField>
              </div>

              {/* Password */}
              <FormField
                id="reg-password"
                label={t('auth.password_label')}
                error={errors.password}
                required
              >
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    maxLength={60}
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

                {/* Password strength visual meter */}
                {form.password && (
                  <div className="mt-2 space-y-1.5" aria-live="polite">
                    <div className="flex gap-1 h-1.5">
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strength.score >= 1 ? strength.color : 'bg-neutral-200'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strength.score >= 2 ? strength.color : 'bg-neutral-200'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strength.score >= 3 ? strength.color : 'bg-neutral-200'
                        }`}
                      />
                    </div>
                    {strength.label && (
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {strength.label}
                      </p>
                    )}
                  </div>
                )}
              </FormField>

              {/* Confirm Password */}
              <FormField
                id="reg-confirm-password"
                label={t('auth.confirm_password_label')}
                error={errors.confirmPassword}
                required
              >
                <div className="relative">
                  <Input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    maxLength={60}
                    placeholder="••••••••"
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormField>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                >
                  {isLoading ? t('auth.registering') : t('auth.sign_up_btn')}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Link to Login */}
          <div className="pt-6 mt-6 border-t border-neutral-100 text-center text-sm text-neutral-600">
            <span>{t('auth.already_have_account')} </span>
            <Link to="/login" className="font-bold text-brand-700 hover:text-brand-800 hover:underline">
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
