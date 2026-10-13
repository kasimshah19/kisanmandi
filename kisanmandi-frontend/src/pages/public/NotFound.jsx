import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function NotFound() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  useDocumentTitle(`${t('common.not_found_title')} | KisanMandi`);

  return (
    <div className="text-center mt-20 px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-2 font-medium">{t('common.not_found_title')}</p>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('common.not_found_desc')}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium">
          {t('common.go_home')}
        </Link>
        {isAuthenticated && user && (
          <Link to={getDashboardPath(user.role)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium">
            {t('common.go_to_dashboard')}
          </Link>
        )}
      </div>
    </div>
  );
}
