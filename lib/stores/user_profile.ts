// interfaces/user_profile.ts
import dayjs from '@/lib/utils/dayjs';
import { supabase } from '@/supabase/client';
import { Database } from '@/supabase/types';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SupportedLanguage } from '../utils/i18n';
import { useAppStore } from './app_state';

export type UserProfile = Database['public']['Tables']['users']['Row'];
interface UserProfileState {
  profile: UserProfile | null;

  // Profile Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;

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

      setProfile: (profile) => {
        set({ profile });

        // Sync profile language to app state if different
        if (profile?.preferred_language) {
          const appState = useAppStore.getState();
          if (appState.currentLanguage !== profile.preferred_language) {
            appState.setLanguage(
              profile.preferred_language as SupportedLanguage
            );
          }
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

        // If language is being updated, sync to app state only if different
        if (updates.preferred_language) {
          const appState = useAppStore.getState();
          if (appState.currentLanguage !== updates.preferred_language) {
            appState.setLanguage(
              updates.preferred_language as SupportedLanguage
            );
          }
        }

        // Sync with Supabase in the background
        syncWithSupabase(state.profile.id, updatedProfile);
      },

      clearProfile: () =>
        set({
          profile: null,
        }),

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
      }),
    }
  )
);

export default useUserProfileStore;
