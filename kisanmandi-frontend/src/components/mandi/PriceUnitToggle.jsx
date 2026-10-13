import { useTranslation } from 'react-i18next';

export default function PriceUnitToggle({ isKg, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center bg-gray-100 p-1 rounded-lg w-fit">
      <button
        onClick={() => onChange(false)}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${!isKg ? 'bg-white shadow-sm font-medium text-green-700' : 'text-gray-600 hover:text-gray-800'}`}
      >
        {t('mandi.toggle_quintal')}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${isKg ? 'bg-white shadow-sm font-medium text-green-700' : 'text-gray-600 hover:text-gray-800'}`}
      >
        {t('mandi.toggle_kg')}
      </button>
    </div>
  );
}
