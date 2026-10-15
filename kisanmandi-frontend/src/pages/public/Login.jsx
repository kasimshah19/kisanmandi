import { useState } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LanguageSwitcher from '../../components/LanguageSwitcher';

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
    
    // Check if target requires a role different from current user's role
    if (fromPath.startsWith('/farmer') && role !== 'ROLE_FARMER' && role !== 'FARMER') return defaultPath;
    if (fromPath.startsWith('/customer') && role !== 'ROLE_CUSTOMER' && role !== 'CUSTOMER') return defaultPath;
    if (fromPath.startsWith('/admin') && role !== 'ROLE_ADMIN' && role !== 'ADMIN') return defaultPath;
    return fromPath;
  };

  // If already logged in, redirect to previous page or role dashboard
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
    <div className="max-w-md mx-auto mt-6 sm:mt-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.login_title')}</h1>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email_label')} <span className="text-red-500">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition text-base"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password with show/hide toggle */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password_label')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition pr-12 text-base"
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !form.email || !form.password}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('auth.logging_in')}</span>
              </>
            ) : (
              t('auth.sign_in_btn')
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('auth.dont_have_account')}{' '}
          <Link to="/register" className="text-green-700 font-semibold hover:underline">
            {t('nav.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

