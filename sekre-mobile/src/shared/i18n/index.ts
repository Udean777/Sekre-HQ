import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import id from './locales/id.json';
import en from './locales/en.json';

export const defaultNS = 'translation';
export const resources = {
  id: { translation: id },
  en: { translation: en },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: 'id',
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false, // React sudah handle XSS
  },
  compatibilityJSON: 'v4',
});

export default i18n;
