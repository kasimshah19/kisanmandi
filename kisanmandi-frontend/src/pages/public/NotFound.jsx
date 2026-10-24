import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home as HomeIcon, LayoutDashboard } from 'lucide-react';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/ui/Button';

export default function NotFound() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  useDocumentTitle(`${t('common.not_found_title')} | KisanMandi`);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Original Simple Farm/Path SVG Illustration */}
        <div className="w-48 h-48 mx-auto relative flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-brand-700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Soft hill / farm furrow background */}
            <circle cx="100" cy="100" r="90" fill="#f0fdf4" />
            <path
              d="M30 140C60 115 130 110 170 145"
              stroke="#bbf7d0"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M10 165C70 140 140 140 190 170"
              stroke="#86efac"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Little plant sprout searching for harvest */}
            <path
              d="M100 135V95M100 95C90 75 70 85 70 95C85 105 95 100 100 95ZM100 95C110 75 130 85 130 95C115 105 105 100 100 95Z"
              stroke="#15803d"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#dcfce7"
            />
            {/* Sun / compass circle */}
            <circle cx="145" cy="55" r="14" fill="#fef08a" stroke="#eab308" strokeWidth="2.5" />
          </svg>
          <span className="absolute top-1/2 -translate-y-1/2 text-7xl font-extrabold text-brand-900/15 select-none">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {t('common.not_found_title')}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
            {t('common.not_found_desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            as={Link}
            to="/"
            variant="outline"
            size="md"
            leftIcon={<HomeIcon size={16} />}
          >
            {t('common.go_home')}
          </Button>
          {isAuthenticated && user && (
            <Button
              as={Link}
              to={getDashboardPath(user.role)}
              variant="primary"
              size="md"
              leftIcon={<LayoutDashboard size={16} />}
            >
              {t('common.go_to_dashboard')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
