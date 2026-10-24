import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, Globe } from 'lucide-react';

const WELCOMED_STORAGE_KEY = 'kisanmandi_welcome_seen';
const LEGACY_STORAGE_KEY = 'kisanmandi_welcomed';

export default function LanguageWelcomeModal({ force = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Skip during automated tests unless explicitly forced via prop or window flag
    if (
      !force &&
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'test' &&
      !window.__FORCE_LANGUAGE_WELCOME__
    ) {
      return;
    }

    // Check if user has already made a selection or been welcomed or is logged in
    try {
      const alreadyWelcomed = localStorage.getItem(WELCOMED_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      const savedLang = localStorage.getItem('kisanmandi_lang');
      const token = localStorage.getItem('kisanmandi_token');

      // Never show to logged in users or users who have already selected language/welcomed
      if (!alreadyWelcomed && !savedLang && !token) {
        setIsOpen(true);
      }
    } catch {
      // Storage access blocked; skip modal
    }
  }, []);

  // Trap focus and handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss('en');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectLanguage = (langCode) => {
    try {
      i18n.changeLanguage(langCode);
      localStorage.setItem('kisanmandi_lang', langCode);
      localStorage.setItem(WELCOMED_STORAGE_KEY, '1');
      localStorage.setItem(LEGACY_STORAGE_KEY, 'true');
      if (typeof document !== 'undefined') {
        document.documentElement.lang = langCode;
      }
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  const handleDismiss = (defaultLang = 'en') => {
    try {
      localStorage.setItem(WELCOMED_STORAGE_KEY, '1');
      localStorage.setItem(LEGACY_STORAGE_KEY, 'true');
      if (!localStorage.getItem('kisanmandi_lang')) {
        localStorage.setItem('kisanmandi_lang', defaultLang);
      }
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  const languageOptions = [
    {
      code: 'hi',
      native: 'हिन्दी',
      english: 'Hindi',
      tagline: 'आसान हिंदी में भाव देखें और फसल बेचें',
      icon: '🌾',
      badge: 'सबसे लोकप्रिय',
    },
    {
      code: 'mr',
      native: 'मराठी',
      english: 'Marathi',
      tagline: 'सोप्या मराठीत बाजारभाव आणि शेतमाल व्यवहार',
      icon: '🚜',
      badge: 'महाराष्ट्र विशेष',
    },
    {
      code: 'en',
      native: 'English',
      english: 'English',
      tagline: 'Farmer marketplace & daily Mandi rate tracker',
      icon: '🌐',
      badge: 'Default',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden transform transition-all p-6 sm:p-8"
      >
        {/* Header with agricultural badge */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100 text-green-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-green-700" aria-hidden="true" />
            <span>KisanMandi • किसानमंडी</span>
          </div>

          <h2
            id="welcome-modal-title"
            className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug"
          >
            अपनी भाषा चुनें <br />
            <span className="text-green-700 font-bold text-lg sm:text-xl">
              तुमची भाषा निवडा / Choose Language
            </span>
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            किसान और ग्राहकों के लिए सबसे सरल अनुभव। बाद में भी कभी भी भाषा बदल सकते हैं।
          </p>
        </div>

        {/* Big 3 Language Option Tiles */}
        <div className="space-y-3" role="radiogroup" aria-label="Choose your preferred language">
          {languageOptions.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`
                  w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4
                  min-h-[72px] outline-none focus-visible:ring-2 focus-visible:ring-green-600
                  ${
                    isSelected
                      ? 'border-green-600 bg-green-50/80 shadow-xs'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50/80 bg-white'
                  }
                `.trim()}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-2xl sm:text-3xl shrink-0" aria-hidden="true">
                    {lang.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                        {lang.native}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">({lang.english})</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 hidden sm:inline-block">
                        {lang.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                      {lang.tagline}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 bg-white text-transparent group-hover:border-green-400'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with skip option */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span>Always switchable via navbar</span>
          </span>
          <button
            type="button"
            onClick={() => handleDismiss('en')}
            className="font-medium text-green-700 hover:text-green-800 hover:underline px-2 py-1 cursor-pointer"
          >
            Continue in English →
          </button>
        </div>
      </div>
    </div>
  );
}
