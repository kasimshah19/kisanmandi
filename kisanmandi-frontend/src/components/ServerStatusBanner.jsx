import { Loader2, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useServerStatus from '../hooks/useServerStatus';

export default function ServerStatusBanner() {
  const { t } = useTranslation();
  const { isWaking, isOffline } = useServerStatus();

  if (isOffline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="sticky top-0 z-50 bg-red-600 text-white px-4 py-2.5 shadow-md flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300"
      >
        <WifiOff size={18} className="shrink-0 animate-pulse" />
        <span>{t('common.offline_banner')}</span>
      </div>
    );
  }

  if (isWaking) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2.5 shadow-md flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300"
      >
        <Loader2 size={18} className="shrink-0 animate-spin" />
        <span>{t('common.waking_banner')}</span>
      </div>
    );
  }

  return null;
}
