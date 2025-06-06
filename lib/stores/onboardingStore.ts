import { create } from 'zustand';

// Types
export interface Question {
  id: string;
  type: 'priority' | 'mini' | 'habit' | 'spinner' | 'mini-result';
  block: 'PriorityQuiz' | 'MiniAssessment' | 'PickOneHabit' | 'SpinnerTailor';
  question?: string;
  options?: string[];
  isCustomScreen?: boolean;
  required?: boolean;
}

export interface OnboardingItem extends Question {
  // Additional metadata for flow items
}

export interface HabitData {
  selectedHabit: string;
  frequency: string;
}

export interface SpinnerData {
  selectedPreferences: string[];
}

export interface MiniAssessmentScore {
  motivation: number;
  consistency: number;
  goals: number;
}

export type AnswerValue = string | string[] | HabitData | SpinnerData;

export interface OnboardingState {
  variant: string | null;
  currentIndex: number;
  answers: Record<string, AnswerValue>;
  totalItems: number;
  startedAt?: number;
  completedAt?: number;
}

interface OnboardingStore extends OnboardingState {
  // Actions
  setVariant: (variant: string) => void;
  setCurrentIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  setTotalItems: (total: number) => void;
  markStarted: () => void;
  markCompleted: () => void;
  resetStore: () => void;

  // Getters
  getProgress: () => number;
  hasAnswer: (questionId: string) => boolean;
  getAnswer: (questionId: string) => AnswerValue | undefined;
}

const initialState: OnboardingState = {
  variant: null,
  currentIndex: 0,
  answers: {},
  totalItems: 0,
  startedAt: undefined,
  completedAt: undefined,
};

export const useOnboardingStore = create<OnboardingStore>()((set, get) => ({
  ...initialState,

  setVariant: (variant) => set({ variant }),

  setCurrentIndex: (currentIndex) => set({ currentIndex }),

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  setTotalItems: (totalItems) => set({ totalItems }),

  markStarted: () => set({ startedAt: Date.now() }),

  markCompleted: () => set({ completedAt: Date.now() }),

  resetStore: () => set(initialState),

  // Getters
  getProgress: () => {
    const state = get();
    if (state.totalItems === 0) return 0;
    return ((state.currentIndex + 1) / state.totalItems) * 100;
  },

  hasAnswer: (questionId) => {
    const state = get();
    return questionId in state.answers;
  },

  getAnswer: (questionId) => {
    const state = get();
    return state.answers[questionId];
  },
}));
