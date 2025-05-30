import * as StoreReview from 'expo-store-review';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  notificationsEnabled: boolean | null;
  promptedReviewMilestones: number[];
  setNotificationsEnabled: (enabled: boolean) => void;
  requestReview: (milestone: number) => Promise<boolean>;
  resetPromptedMilestones: () => void;
  clearAllData: () => void;
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
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => appStorageAdapter),
      partialize: (state) => ({
        notificationsEnabled: state.notificationsEnabled,
        promptedReviewMilestones: state.promptedReviewMilestones,
      }),
    }
  )
);
