import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
  { code: 'mr', label: 'मराठी', short: 'म' },
];

export default function LanguageSwitcher({ className = '', variant = 'pill' }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-1 bg-gray-100/90 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200 shadow-xs ${className}`}
    >
      <div className="flex items-center pl-1.5 pr-0.5 text-gray-500" aria-hidden="true">
        <Languages size={15} />
      </div>
      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={`Switch language to ${lang.label}`}
              aria-pressed={isActive}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all min-h-[36px] flex items-center justify-center ${
                isActive
                  ? 'bg-white text-green-700 shadow-xs ring-1 ring-black/5 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
