import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAppStore } from '../stores/app_state';
import { SupportedLanguage } from '../utils/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const { currentLanguage, setLanguage, isLanguageInitialized } = useAppStore();

  const changeLanguage = async (language: SupportedLanguage) => {
    await setLanguage(language);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    isReady: i18n.isInitialized && isLanguageInitialized,
  };
};
