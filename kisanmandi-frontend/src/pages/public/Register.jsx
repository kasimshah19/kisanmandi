import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Tractor, ShoppingBag, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function Register() {
  const { t } = useTranslation();
  useDocumentTitle('Register | KisanMandi');

  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="max-w-lg mx-auto mt-6 sm:mt-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.register_title')}</h1>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Role Selector Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.select_role')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => selectRole('FARMER')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center justify-center space-y-2 min-h-[96px] ${
                  form.role === 'FARMER'
                    ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}
              >
                <Tractor className="h-8 w-8 text-green-700" />
                <span className="text-center">{t('auth.role_farmer_title')}</span>
              </button>
              <button
                type="button"
                onClick={() => selectRole('CUSTOMER')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center justify-center space-y-2 min-h-[96px] ${
                  form.role === 'CUSTOMER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600'
                }`}
              >
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <span className="text-center">{t('auth.role_customer_title')}</span>
              </button>
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1.5">{errors.role}</p>}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.full_name_label')} <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition text-base ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="e.g. Ramesh Patel"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email_label')} <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={150}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition text-base ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.phone_label')} <span className="text-red-500">*</span>
            </label>
            <input
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
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition text-base ${
                errors.phone ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="10 digit mobile number"
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password_label')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                maxLength={60}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition pr-12 text-base ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirm_password_label')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                maxLength={60}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition pr-12 text-base ${
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99] mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('auth.registering')}</span>
              </>
            ) : (
              t('auth.sign_up_btn')
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('auth.already_have_account')}{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

