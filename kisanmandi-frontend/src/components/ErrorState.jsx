import { AlertCircle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ErrorState({
  title,
  message,
  onRetry,
}) {
  const { t } = useTranslation();
  const effectiveTitle = title || t('errors.generic_retry');
  const effectiveMessage = message || t('errors.network_error');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm my-4">
      <div className="bg-red-50 text-red-600 rounded-full p-4 mb-4">
        <AlertCircle size={36} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{effectiveTitle}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{effectiveMessage}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition active:scale-95 shadow-sm"
        >
          <RotateCcw size={16} />
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
