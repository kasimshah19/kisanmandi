import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home as HomeIcon, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/ui/Button';

export default function Unauthorized() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  useDocumentTitle(`${t('common.unauthorized_title')} | KisanMandi`);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Simple Original Shield / Lock SVG Illustration */}
        <div className="w-44 h-44 mx-auto relative flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-red-600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="88" fill="#fef2f2" />
            {/* Shield outline */}
            <path
              d="M100 35L150 55V105C150 140 125 165 100 175C75 165 50 140 50 105V55L100 35Z"
              stroke="#ef4444"
              strokeWidth="4"
              fill="#fee2e2"
              strokeLinejoin="round"
            />
            {/* Lock shackle & body */}
            <rect x="82" y="98" width="36" height="28" rx="6" fill="#dc2626" />
            <path
              d="M89 98V86C89 80 94 75 100 75C106 75 111 80 111 86V98"
              stroke="#dc2626"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="110" r="3" fill="white" />
            <path d="M100 113V119" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="absolute top-1/2 -translate-y-1/2 text-7xl font-extrabold text-red-900/10 select-none">
            403
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {t('common.unauthorized_title')}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
            {t('common.unauthorized_desc')}
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
