import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PriceUnitToggle({ isKg, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center bg-neutral-100 p-1 rounded-xl w-fit">
      <button
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
          !isKg
            ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        {t('mandi.toggle_quintal')}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
          isKg
            ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        {t('mandi.toggle_kg')}
      </button>
    </div>
  );
}
