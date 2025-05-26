import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { Achievement, StreakDays } from '@/lib/habit-store/types';
import { create } from 'zustand';

export type ModalType =
  | 'achievement'
  | 'confirmation'
  | 'settings'
  | 'sort'
  | null;

interface ModalState {
  currentModal: ModalType;
  achievements: Achievement[];
  confirmationData: {
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  settingsData: {
    initialSection?: string;
  };

  showAchievementModal: (streakDays: StreakDays[]) => void;
  showSettingsModal: (initialSection?: string) => void;
  showSortModal: () => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  currentModal: null,
  achievements: [],
  confirmationData: {},
  settingsData: {},

  showAchievementModal: (streakDays: StreakDays[]) => {
    const achievementObjects = streakDays.map((days) => ACHIEVEMENTS[days]);

    set({
      currentModal: 'achievement',
      achievements: achievementObjects,
    });
  },

  showSettingsModal: (initialSection) =>
    set({
      currentModal: 'settings',
      settingsData: { initialSection },
    }),

  showSortModal: () => set({ currentModal: 'sort' }),

  hideModal: () =>
    set({
      currentModal: null,
      achievements: [],
      confirmationData: {},
      settingsData: {},
    }),
}));
