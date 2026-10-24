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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-xl border border-neutral-200/80 text-center space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle size={30} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {i18n.t('common.something_went_wrong')}
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {i18n.t('common.error_boundary_desc')}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReload}
                leftIcon={<RefreshCw size={16} />}
              >
                {i18n.t('common.reload_page')}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={this.handleHome}
                leftIcon={<Home size={16} />}
              >
                {i18n.t('common.go_home')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
