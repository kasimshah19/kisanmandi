import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import i18n from '../i18n';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  handleDashboard = () => {
    try {
      const userStr = localStorage.getItem('kisanmandi_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = user?.role || localStorage.getItem('kisanmandi_role');
      if (role === 'ROLE_ADMIN' || role === 'ADMIN') window.location.href = '/admin/dashboard';
      else if (role === 'ROLE_FARMER' || role === 'FARMER') window.location.href = '/farmer/dashboard';
      else window.location.href = '/customer/dashboard';
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      let hasToken = false;
      try {
        hasToken = Boolean(localStorage.getItem('kisanmandi_token'));
      } catch {
        hasToken = false;
      }

      return (
        <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-xl border border-stone-200 text-center space-y-6">
            {/* Friendly Harvest / Sprout SVG Illustration */}
            <div className="w-40 h-40 mx-auto relative flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-amber-600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="100" cy="100" r="88" fill="#fef3c7" />
                <path
                  d="M40 145C75 125 125 125 160 145"
                  stroke="#fde68a"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="85" r="28" fill="#fef08a" stroke="#f59e0b" strokeWidth="3" />
                <path
                  d="M93 72L107 98M107 72L93 98"
                  stroke="#b45309"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M85 105C92 100 108 100 115 105"
                  stroke="#b45309"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {i18n.t('common.something_went_wrong', 'Something unexpected happened')}
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                {i18n.t(
                  'common.error_boundary_desc',
                  'An unexpected glitch occurred. Your data is safe; please reload or return to the home page.'
                )}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={this.handleHome}
                leftIcon={<Home size={18} />}
                className="min-h-[50px] font-bold"
              >
                {i18n.t('common.go_home', 'Go to home')}
              </Button>

              {hasToken ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleDashboard}
                  className="min-h-[50px] font-bold"
                >
                  {i18n.t('common.go_to_dashboard', 'Go to my dashboard')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleReload}
                  leftIcon={<RefreshCw size={18} />}
                  className="min-h-[50px] font-bold"
                >
                  {i18n.t('common.reload_page', 'Reload page')}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
