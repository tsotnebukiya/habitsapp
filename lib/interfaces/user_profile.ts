// interfaces/user_profile.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
};

interface UserProfileState {
  profile: UserProfile | null;

  // Profile Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;

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

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      clearProfile: () => set({ profile: null }),

      completeOnboarding: () =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                onboardingComplete: true,
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      resetOnboarding: () =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                onboardingComplete: false,
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      isOnboardingComplete: () => {
        const state = get();
        return Boolean(state.profile?.onboardingComplete);
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
