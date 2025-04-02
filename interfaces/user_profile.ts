// interfaces/user_profile.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// We use MMKV for User Profile storage over AsyncStorage
// because it's much faster.
export const storage = new MMKV({
  id: 'user-profile-store',
  encryptionKey: 'your-encryption-key' // Optional
});

// Create MMKV storage adapter for Zustand
const mmkvZustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

// stores/useUserProfileStore.ts
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
  encryptionKey: 'profile-encryption-key'
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

      updateProfile: (updates) => set((state) => ({
        profile: state.profile
          ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
          : null
      })),

      clearProfile: () => set({ profile: null }),

      completeOnboarding: () => set((state) => ({
        profile: state.profile
          ? {
            ...state.profile,
            onboardingComplete: true,
            updatedAt: new Date().toISOString()
          }
          : null
      })),

      resetOnboarding: () => set((state) => ({
        profile: state.profile
          ? {
            ...state.profile,
            onboardingComplete: false,
            updatedAt: new Date().toISOString()
          }
          : null
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

// Example usage:
/*
import { useUserProfileStore } from './store/useUserProfileStore';

// In your component:
const { 
  profile, 
  isLoading,
  updateProfile, 
  setTheme, 
  setNotificationPreferences, 
} = useUserProfileStore();

// Update profile
updateProfile({ 
  firstName: 'John',
  lastName: 'Doe'
});

// Update theme
setTheme('dark');

// Update notifications
setNotificationPreferences(true, false);

// Access profile data
console.log(profile?.preferences.theme);
*/

export default useUserProfileStore;