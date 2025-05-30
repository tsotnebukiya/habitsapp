// interfaces/user_profile.ts
import dayjs from '@/lib/utils/dayjs';
import { supabase } from '@/supabase/client';
import { Database } from '@/supabase/types';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { configureCalendarLocale } from '../utils/calendarLocalization';
import i18n, { SupportedLanguage } from '../utils/i18n';

export type UserProfile = Database['public']['Tables']['users']['Row'];
interface UserProfileState {
  profile: UserProfile | null;

  // Language state
  currentLanguage: SupportedLanguage;
  isLanguageInitialized: boolean;

  // Profile Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;

  // Language Actions
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  initializeLanguage: () => Promise<void>;

  // Notification Actions
  setStreakNotificationsEnabled: (enabled: boolean) => void;
  setDailyUpdateNotificationsEnabled: (enabled: boolean) => void;

  // Onboarding Actions
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isOnboardingComplete: () => boolean;
}

export const profileStorage = new MMKV({
  id: 'user-profile-store',
  encryptionKey: 'profile-encryption-key',
});

const profileStorageAdapter = {
  setItem: (name: string, value: string) => profileStorage.set(name, value),
  getItem: (name: string) => profileStorage.getString(name) ?? null,
  removeItem: (name: string) => profileStorage.delete(name),
};

const syncWithSupabase = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  }
};

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,

      // Language state
      currentLanguage: 'en',
      isLanguageInitialized: false,

      setProfile: (profile) => {
        set({ profile });

        // Initialize language from profile if available and not already initialized
        const { isLanguageInitialized } = get();
        if (!isLanguageInitialized && profile?.preferred_language) {
          get().initializeLanguage();
        }
      },

      updateProfile: (updates) => {
        const state = get();
        if (!state.profile?.id) return;

        // Immediately update local state
        const updatedProfile = {
          ...updates,
          updated_at: dayjs().toISOString(),
        };

        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                ...updatedProfile,
              }
            : null,
        }));

        // Sync with Supabase in the background
        syncWithSupabase(state.profile.id, updatedProfile);
      },

      clearProfile: () =>
        set({
          profile: null,
          currentLanguage: 'en',
          isLanguageInitialized: false,
        }),

      setLanguage: async (language: SupportedLanguage) => {
        try {
          await i18n.changeLanguage(language);
          configureCalendarLocale(language);
          set({ currentLanguage: language });

          // Update profile in backend if user is logged in
          const state = get();
          if (state.profile?.id) {
            get().updateProfile({ preferred_language: language });
          }
        } catch (error) {
          console.error('Failed to change language:', error);
        }
      },

      initializeLanguage: async () => {
        try {
          const { currentLanguage, isLanguageInitialized, profile } = get();

          // Only initialize once
          if (isLanguageInitialized) return;

          // Use profile language if available, otherwise use stored language
          const languageToUse =
            (profile?.preferred_language as SupportedLanguage) ||
            currentLanguage;
          await i18n.changeLanguage(languageToUse);
          configureCalendarLocale(languageToUse);
          set({
            currentLanguage: languageToUse,
            isLanguageInitialized: true,
          });
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

      setStreakNotificationsEnabled: (enabled) => {
        get().updateProfile({
          allow_streak_notifications: enabled,
        });
      },

      setDailyUpdateNotificationsEnabled: (enabled) => {
        get().updateProfile({
          allow_daily_update_notifications: enabled,
        });
      },

      completeOnboarding: () => {
        get().updateProfile({
          onboarding_complete: true,
        });
      },

      resetOnboarding: () => {
        get().updateProfile({
          onboarding_complete: false,
        });
      },

      isOnboardingComplete: () => {
        const state = get();
        return Boolean(state.profile?.onboarding_complete);
      },
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => profileStorageAdapter),
      partialize: (state) => ({
        profile: state.profile,
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);

// Auto-initialize language when store is created
useUserProfileStore.getState().initializeLanguage();

export default useUserProfileStore;
