import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import id from './locales/id.json';

export const defaultNS = 'translation';

/**
 * Detect device locale — ambil bahasa dari sistem operasi.
 * Fallback ke 'id' kalau tidak bisa dideteksi.
 *
 * Tidak pakai react-native-localize untuk menghindari dependency baru.
 * NativeModules.I18nManager tersedia di semua RN versi.
 */
const getDeviceLocale = (): string => {
  const locale: string =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
        'id'
      : NativeModules.I18nManager?.localeIdentifier ?? 'id';

  // Ambil hanya kode bahasa (misal 'id' dari 'id_ID', 'en' dari 'en_US')
  return locale.split(/[-_]/)[0] ?? 'id';
};

const supportedLocales = ['id', 'en'] as const;
type SupportedLocale = (typeof supportedLocales)[number];

const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  supportedLocales.some(l => l === locale);

const deviceLocale = getDeviceLocale();
const lng: SupportedLocale = isSupportedLocale(deviceLocale) ? deviceLocale : 'id';

/**
 * Resources — hanya 'id' di-bundle eager karena itu default locale.
 * 'en' di-load lazy saat dibutuhkan (device locale = en).
 *
 * Ini mengurangi bundle size untuk mayoritas user Indonesia yang pakai 'id'.
 */
export const resources = {
  id: { translation: id },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: 'id',
  defaultNS,
  interpolation: {
    escapeValue: false, // React sudah handle XSS
  },
  compatibilityJSON: 'v4',
});

// Lazy load 'en' hanya jika device locale adalah English
if (lng === 'en') {
  void import('./locales/en.json').then(enModule => {
    i18n.addResourceBundle('en', 'translation', enModule.default, true, true);
  });
}

export default i18n;
