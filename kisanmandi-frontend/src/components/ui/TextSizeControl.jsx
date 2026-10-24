import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTextSize } from '../../context/TextSizeContext';

export default function TextSizeControl({ className = '', variant = 'compact' }) {
  const { t } = useTranslation();
  const { textSize, setTextSize } = useTextSize();

  const options = [
    {
      id: 'normal',
      label: 'A',
      title: t('text_size.normal', 'Normal text size'),
      sizeClass: 'text-xs font-semibold',
    },
    {
      id: 'large',
      label: 'A+',
      title: t('text_size.large', 'Large text size'),
      sizeClass: 'text-sm font-bold',
    },
    {
      id: 'xlarge',
      label: 'A++',
      title: t('text_size.xlarge', 'Largest text size'),
      sizeClass: 'text-base font-extrabold',
    },
  ];

  if (variant === 'full') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <label className="text-xs font-semibold text-gray-700">
          {t('text_size.label', 'Text Size')}
        </label>
        <div
          role="radiogroup"
          aria-label={t('text_size.label', 'Text Size')}
          className="grid grid-cols-3 gap-2"
        >
          {options.map((opt) => {
            const isSelected = textSize === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTextSize(opt.id)}
                title={opt.title}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-center border font-medium transition-all ${
                  isSelected
                    ? 'bg-green-700 text-white border-green-700 shadow-xs font-bold'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-green-50 hover:border-green-300'
                }`}
              >
                <span className={opt.sizeClass}>{opt.label}</span>
                <span className="block text-[11px] font-normal opacity-90 mt-0.5">
                  {opt.id === 'normal'
                    ? t('text_size.normal_short', 'Normal')
                    : opt.id === 'large'
                    ? t('text_size.large_short', 'Large')
                    : t('text_size.xlarge_short', 'Extra')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact variant for Navbar
  return (
    <div
      role="radiogroup"
      aria-label={t('text_size.label', 'Text Size')}
      className={`inline-flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200/80 ${className}`}
    >
      {options.map((opt) => {
        const isSelected = textSize === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTextSize(opt.id)}
            title={opt.title}
            aria-label={opt.title}
            className={`min-h-[34px] min-w-[34px] px-2 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-white text-green-800 font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <span className={opt.sizeClass}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
