import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import BigChoice from '../../components/ui/BigChoice';
import HeroFarmScene from '../../components/illustrations/HeroFarmScene';

export default function Register() {
  const { t } = useTranslation();
  useDocumentTitle('Register | KisanMandi');

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Preselect role from query param ?role=FARMER or ?role=CUSTOMER
  const roleParam = searchParams.get('role')?.toUpperCase();
  const validInitialRole = roleParam === 'FARMER' || roleParam === 'CUSTOMER' ? roleParam : 'CUSTOMER';

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
    if ((qRole === 'FARMER' || qRole === 'CUSTOMER') && form.role !== qRole) {
      setForm((prev) => ({ ...prev, role: qRole }));
    }
  }, [searchParams]);

  // Compute password strength hint (words + color, aria-live)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    if (pwd.length < 6) {
      return { score: 1, label: t('auth.strength_weak', 'Weak (need at least 6 characters)'), color: 'bg-rose-500' };
    }
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    const variety = [hasLetters, hasNumbers, hasSpecial].filter(Boolean).length;
    if (pwd.length >= 8 && variety >= 2) {
      return { score: 3, label: t('auth.strength_strong', 'Strong password'), color: 'bg-emerald-600' };
    }
    return { score: 2, label: t('auth.strength_fair', 'Fair (add numbers or symbols)'), color: 'bg-amber-500' };
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
    if (!form.name.trim()) e.name = t('errors.field_required', 'Full name is required');
    if (!form.email.trim()) e.email = t('errors.field_required', 'Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('auth.email_invalid', 'Enter a valid email address');
    if (!form.phone.trim()) e.phone = t('errors.field_required', 'Mobile number is required');
    else if (!/^[0-9]{10}$/.test(form.phone)) e.phone = t('auth.phone_invalid', 'Enter a valid 10-digit mobile number');
    if (!form.password) e.password = t('errors.field_required', 'Password is required');
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = t('auth.password_mismatch', 'Passwords do not match');
    if (!form.role) e.role = t('errors.field_required', 'Please choose your role');
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
      toast.success(t('auth.register_success', 'Account created! Please sign in.'));
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.server_timeout', 'Failed to register. Please try again.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-card border border-stone-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Panel: On lg full height, on mobile a compact top header */}
        <div className="flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b] text-white p-5 sm:p-8 lg:p-10 lg:col-span-5">
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-amber-400/10 blur-3xl rounded-full"
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

            {/* 3 Truthful Farmer/Buyer Benefits */}
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.farmer_benefit_1', 'Zero dalal commission — keep 100% of your earnings')}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.farmer_benefit_2', 'Set your own prices backed by official mandi data')}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-xs sm:text-sm text-green-50/90 leading-snug">
                  {t('auth.farmer_benefit_3', 'Instant cash on delivery when customers receive harvest')}
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
                {t('auth.register_title', 'Create your account')}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {t('auth.register_subtitle', 'Join the fair direct agricultural network today.')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Role Choice with Two BigChoice Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  {t('auth.select_role', 'Select what you want to do')} <span className="text-rose-500">*</span>
                </label>
                <div
                  role="radiogroup"
                  aria-label={t('auth.select_role', 'Select what you want to do')}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <BigChoice
                    selected={form.role === 'CUSTOMER'}
                    onSelect={() => selectRole('CUSTOMER')}
                    icon="🛍️"
                    title={t('auth.role_buy_title', 'I want to BUY')}
                    description={t('auth.role_buy_desc', 'Fresh produce from nearby farmers')}
                  />
                  <BigChoice
                    selected={form.role === 'FARMER'}
                    onSelect={() => selectRole('FARMER')}
                    icon="🧑‍🌾"
                    title={t('auth.role_sell_title', 'I want to SELL')}
                    description={t('auth.role_sell_desc', 'List crops and sell at fair prices')}
                  />
                </div>
                {errors.role && <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.role}</p>}
              </div>

              {/* Full Name */}
              <FormField
                id="reg-name"
                label={t('auth.full_name_label', 'Full Name')}
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
                  className="h-14 min-h-[56px] text-base"
                  required
                />
              </FormField>

              {/* Email & Phone side by side on sm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="reg-email"
                  label={t('auth.email_label', 'Email Address')}
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
                    className="h-14 min-h-[56px] text-base"
                    required
                  />
                </FormField>

                <FormField
                  id="reg-phone"
                  label={t('auth.phone_label', 'Mobile Number')}
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
                    placeholder="10-digit mobile"
                    className="h-14 min-h-[56px] text-base"
                    required
                  />
                </FormField>
              </div>

              {/* Password */}
              <FormField
                id="reg-password"
                label={t('auth.password_label', 'Password')}
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
                    className="h-14 min-h-[56px] text-base pr-24"
                    required
                  />
                  {/* Show/Hide password with word + icon */}
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

                {/* Password strength meter with words + color + aria-live */}
                {form.password && (
                  <div className="mt-2 space-y-1.5" aria-live="polite">
                    <div className="flex gap-1.5 h-1.5">
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strength.score >= 1 ? strength.color : 'bg-stone-200'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strength.score >= 2 ? strength.color : 'bg-stone-200'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strength.score >= 3 ? strength.color : 'bg-stone-200'
                        }`}
                      />
                    </div>
                    {strength.label && (
                      <p className="text-xs text-stone-600 font-medium">
                        {strength.label}
                      </p>
                    )}
                  </div>
                )}
              </FormField>

              {/* Confirm Password */}
              <FormField
                id="reg-confirm-password"
                label={t('auth.confirm_password_label', 'Confirm Password')}
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
                    className="h-14 min-h-[56px] text-base pr-24"
                    required
                  />
                  {/* Show/Hide password with word + icon */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg min-h-[38px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showConfirmPassword ? t('auth.hide_pwd', 'Hide') : t('auth.show_pwd', 'Show')}</span>
                  </button>
                </div>
              </FormField>

              {/* Big Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="xl"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[56px] text-base font-bold"
                >
                  {isLoading ? t('auth.registering', 'Creating account...') : t('auth.sign_up_btn', 'Create Free Account')}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Link to Login */}
          <div className="pt-6 mt-6 border-t border-stone-100 text-center text-sm text-stone-600">
            <span>{t('auth.already_have_account', 'Already have an account?')} </span>
            <Link to="/login" className="font-bold text-green-800 hover:text-green-900 underline underline-offset-2">
              {t('nav.login', 'Sign in here')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
