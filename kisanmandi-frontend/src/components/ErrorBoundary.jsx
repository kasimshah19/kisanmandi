import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import i18n from '../i18n';

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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-lg border border-gray-100 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {i18n.t('common.something_went_wrong')}
            </h1>

            <p className="text-sm text-gray-600">
              {i18n.t('common.error_boundary_desc')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition active:scale-95"
              >
                <RefreshCw size={18} />
                {i18n.t('common.reload_page')}
              </button>

              <button
                type="button"
                onClick={this.handleHome}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition active:scale-95"
              >
                <Home size={18} />
                {i18n.t('common.go_home')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
