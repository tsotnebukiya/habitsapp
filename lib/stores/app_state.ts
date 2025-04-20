import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

interface AppState {
  notificationsEnabled: boolean | null;
  setNotificationsEnabled: (enabled: boolean) => void;
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
    (set) => ({
      notificationsEnabled: null,
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => appStorageAdapter),
      partialize: (state) => ({
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
