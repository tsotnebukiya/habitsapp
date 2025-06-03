import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAppStore } from '../stores/app_state';
import { useUserProfileStore } from '../stores/user_profile';
import { SupportedLanguage } from '../utils/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const { currentLanguage, setLanguage, isLanguageInitialized } = useAppStore();
  const { updateProfile, profile } = useUserProfileStore();

  const changeLanguage = async (language: SupportedLanguage) => {
    // Update app state (i18n + local storage)
    await setLanguage(language);

    // Update user profile if user is logged in
    // This ensures the language preference is saved to Supabase
    if (profile?.id) {
      updateProfile({ preferred_language: language });
    }
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    isReady: i18n.isInitialized && isLanguageInitialized,
  };
};
