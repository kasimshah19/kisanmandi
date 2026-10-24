export const LANGUAGES = [
  { code: 'en', native: 'English', short: 'EN', english: 'English' },
  { code: 'hi', native: 'हिन्दी', short: 'हि', english: 'Hindi' },
  { code: 'mr', native: 'मराठी', short: 'म', english: 'Marathi' },
];

export const getLanguage = (code) => {
  const normalized = (code || 'en').split('-')[0];
  return LANGUAGES.find((l) => l.code === normalized) || LANGUAGES[0];
};
