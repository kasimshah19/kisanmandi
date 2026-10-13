import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-800 text-white text-center py-6 mt-auto">
      <p>&copy; {new Date().getFullYear()} KisanMandi. {t('common.footer_tagline')}</p>
    </footer>
  );
}
