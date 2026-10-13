import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';

const detectorOptions = {
  order: ['localStorage', 'navigator'],
  lookupLocalStorage: 'kisanmandi_lang',
  caches: ['localStorage'],
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'mr'],
    detection: detectorOptions,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

// Update html lang attribute on language change
const updateHtmlLang = (lng) => {
  if (typeof document !== 'undefined') {
    const primary = (lng || 'en').split('-')[0];
    document.documentElement.lang = primary;
  }
};

updateHtmlLang(i18n.resolvedLanguage || i18n.language);

i18n.on('languageChanged', (lng) => {
  updateHtmlLang(lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('kisanmandi_lang', lng);
  }
});

export default i18n;
