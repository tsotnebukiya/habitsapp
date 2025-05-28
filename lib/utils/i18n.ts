import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import english from '../translations/english.json';
import french from '../translations/french.json';
import german from '../translations/german.json';
import portuguese from '../translations/portuguese.json';
import russian from '../translations/russian.json';
import spanish from '../translations/spanish.json';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
};

// Function to detect device language and map to supported language
const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.getLocales()[0];
  const languageCode = deviceLocale?.languageCode?.toLowerCase();

  // Map device language codes to our supported languages
  switch (languageCode) {
    case 'es':
      return 'es';
    case 'fr':
      return 'fr';
    case 'de':
      return 'de';
    case 'pt':
      return 'pt';
    case 'ru':
      return 'ru';
    default:
      return 'en'; // Default to English
  }
};

// Initialize i18n only if it hasn't been initialized yet
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    debug: __DEV__,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: english,
      },
      es: {
        translation: spanish,
      },
      fr: {
        translation: french,
      },
      de: {
        translation: german,
      },
      pt: {
        translation: portuguese,
      },
      ru: {
        translation: russian,
      },
    },
  });
}

export default i18n;
