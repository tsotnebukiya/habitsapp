import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useUserProfileStore } from '../stores/user_profile';
import { SupportedLanguage } from '../utils/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const { currentLanguage, setLanguage, isLanguageInitialized } =
    useUserProfileStore();

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
