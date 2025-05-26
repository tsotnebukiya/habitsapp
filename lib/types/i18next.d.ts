import 'i18next';
import type english from '../translations/english.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof english;
    };
  }
}
