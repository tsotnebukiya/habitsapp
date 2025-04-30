import { create } from 'zustand';
import { Achievement } from '@/lib/habit-store/types';

export type ModalType = 'achievement' | 'confirmation' | 'settings' | null;

interface ModalState {
  currentModal: ModalType;
  achievements: Achievement[];
  currentAchievementIndex: number;
  confirmationData: {
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  settingsData: {
    initialSection?: string;
  };

  showAchievementModal: (achievements: Achievement[]) => void;
  showConfirmationModal: (data: {
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  showSettingsModal: (initialSection?: string) => void;
  hideModal: () => void;
  goToNextAchievement: () => void;
  goToPrevAchievement: () => void;
  setAchievementIndex: (index: number) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  currentModal: null,
  achievements: [],
  currentAchievementIndex: 0,
  confirmationData: {},
  settingsData: {},

  showAchievementModal: (achievements) =>
    set({
      currentModal: 'achievement',
      achievements,
      currentAchievementIndex: 0,
    }),

  showConfirmationModal: (data) =>
    set({
      currentModal: 'confirmation',
      confirmationData: data,
    }),

  showSettingsModal: (initialSection) =>
    set({
      currentModal: 'settings',
      settingsData: { initialSection },
    }),

  hideModal: () =>
    set({
      currentModal: null,
      achievements: [],
      confirmationData: {},
      settingsData: {},
    }),

  goToNextAchievement: () => {
    const { achievements, currentAchievementIndex } = get();
    if (currentAchievementIndex < achievements.length - 1) {
      set({ currentAchievementIndex: currentAchievementIndex + 1 });
    }
  },

  goToPrevAchievement: () => {
    const { currentAchievementIndex } = get();
    if (currentAchievementIndex > 0) {
      set({ currentAchievementIndex: currentAchievementIndex - 1 });
    }
  },

  setAchievementIndex: (index) => {
    const { achievements } = get();
    if (index >= 0 && index < achievements.length) {
      set({ currentAchievementIndex: index });
    }
  },
}));
