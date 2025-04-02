// interfaces/app_state.ts
// stores/useAppStateStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

export const appStorage = new MMKV({
  id: 'app-state-store',
  encryptionKey: 'app-encryption-key'
});

const appStorageAdapter = {
  setItem: (name: string, value: string) => appStorage.set(name, value),
  getItem: (name: string) => appStorage.getString(name) ?? null,
  removeItem: (name: string) => appStorage.delete(name),
};

export type Theme = 'light' | 'dark' | 'system';

export interface AppPreferences {
  theme: Theme;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}

interface AppState {
  // State
  preferences: AppPreferences;
  metadata: Record<string, any>;
  isLoading: boolean;
  error: string | null;

  // Preferences Actions
  updatePreferences: (updates: Partial<AppPreferences>) => void;
  setTheme: (theme: Theme) => void;
  setNotificationPreferences: (email: boolean, push: boolean) => void;
  setLanguage: (language: string) => void;

  // Metadata Actions
  setMetadata: (key: string, value: any) => void;
  removeMetadata: (key: string) => void;

  // Status Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialPreferences: AppPreferences = {
  theme: 'system',
  emailNotifications: true,
  pushNotifications: true,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export const useAppStateStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      preferences: initialPreferences,
      metadata: {},
      isLoading: false,
      error: null,

      // Preferences Actions
      updatePreferences: (updates) => 
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        })),

      setTheme: (theme) => {
        const { updatePreferences } = get();
        updatePreferences({ theme });
      },

      setNotificationPreferences: (email, push) => {
        const { updatePreferences } = get();
        updatePreferences({
          emailNotifications: email,
          pushNotifications: push
        });
      },

      setLanguage: (language) => {
        const { updatePreferences } = get();
        updatePreferences({ language });
      },

      // Metadata Actions
      setMetadata: (key, value) => 
        set((state) => ({
          metadata: { ...state.metadata, [key]: value }
        })),

      removeMetadata: (key) => 
        set((state) => {
          const newMetadata = { ...state.metadata };
          delete newMetadata[key];
          return { metadata: newMetadata };
        }),

      // Status Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'app-state-storage',
      storage: createJSONStorage(() => appStorageAdapter),
      partialize: (state) => ({
        preferences: state.preferences,
        metadata: state.metadata,
      }),
    }
  )
);
