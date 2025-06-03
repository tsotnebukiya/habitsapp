import * as StoreReview from 'expo-store-review';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { configureCalendarLocale } from '../utils/calendarLocalization';
import i18n, { SupportedLanguage } from '../utils/i18n';

interface AppState {
  notificationsEnabled: boolean | null;
  promptedReviewMilestones: number[];

  // Language state
  currentLanguage: SupportedLanguage;
  isLanguageInitialized: boolean;

  setNotificationsEnabled: (enabled: boolean) => void;
  requestReview: (milestone: number) => Promise<boolean>;
  resetPromptedMilestones: () => void;
  clearAllData: () => void;

  // Language actions
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  initializeLanguage: () => Promise<void>;
}

export const appStorage = new MMKV({
  id: 'app-store',
  encryptionKey: 'app-encryption-key',
});

const appStorageAdapter = {
  setItem: (name: string, value: string) => appStorage.set(name, value),
  getItem: (name: string) => appStorage.getString(name) ?? null,
  removeItem: (name: string) => appStorage.delete(name),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      notificationsEnabled: null,
      promptedReviewMilestones: [],

      // Language state
      currentLanguage: 'en',
      isLanguageInitialized: false,

      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      requestReview: async (milestone: number) => {
        try {
          const { promptedReviewMilestones } = get();
          if (promptedReviewMilestones.includes(milestone)) {
            return false;
          }

          const isAvailable = await StoreReview.isAvailableAsync();

          if (!isAvailable) {
            return false;
          }

          await StoreReview.requestReview();

          set({
            promptedReviewMilestones: [...promptedReviewMilestones, milestone],
          });
          return true;
        } catch (error) {
          return false;
        }
      },

      resetPromptedMilestones: () => {
        set({ promptedReviewMilestones: [] });
      },

      clearAllData: () => {
        set({
          notificationsEnabled: null,
          promptedReviewMilestones: [],
          currentLanguage: 'en',
          isLanguageInitialized: false,
        });
      },

      setLanguage: async (language: SupportedLanguage) => {
        try {
          await i18n.changeLanguage(language);
          configureCalendarLocale(language);
          set({ currentLanguage: language });
        } catch (error) {
          console.error('Failed to change language:', error);
        }
      },

      initializeLanguage: async () => {
        try {
          const { currentLanguage, isLanguageInitialized } = get();

          // Only initialize once
          if (isLanguageInitialized) return;

          await i18n.changeLanguage(currentLanguage);
          configureCalendarLocale(currentLanguage);
          set({ isLanguageInitialized: true });
        } catch (error) {
          console.error('Failed to initialize language:', error);
          // Fallback to English
          await i18n.changeLanguage('en');
          configureCalendarLocale('en');
          set({
            currentLanguage: 'en',
            isLanguageInitialized: true,
          });
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => appStorageAdapter),
      partialize: (state) => ({
        notificationsEnabled: state.notificationsEnabled,
        promptedReviewMilestones: state.promptedReviewMilestones,
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);

// Auto-initialize language when store is created
useAppStore.getState().initializeLanguage();
