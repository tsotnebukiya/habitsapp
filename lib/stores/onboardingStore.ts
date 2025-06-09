import { miniAssessmentQuestions } from '@/lib/constants/onboardingQuestions';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Create MMKV storage for onboarding
const onboardingStorage = new MMKV({
  id: 'onboarding-store',
  encryptionKey: 'onboarding-encryption-key',
});

const onboardingStorageAdapter = {
  setItem: (name: string, value: string) => onboardingStorage.set(name, value),
  getItem: (name: string) => onboardingStorage.getString(name) ?? null,
  removeItem: (name: string) => onboardingStorage.delete(name),
};

// Simplified types for new onboarding flows
export interface Question {
  id: string;
  type: 'priority' | 'mini' | 'loading' | 'matrix' | 'value';
  question?: string;
  questionKey?: string;
  options?: string[];
  optionKeys?: string[];
  optionIcons?: string[];
  required?: boolean;
}

export interface OnboardingItem extends Question {
  // Additional metadata for flow items
}

// Matrix scores for the 5 categories from HabitTemplates
export interface MatrixScores {
  cat1: number; // Vitality
  cat2: number; // Wisdom
  cat3: number; // Harmony
  cat4: number; // Spirit
  cat5: number; // Ambition
}

// Helper function to calculate matrix scores from mini assessment answers
export function calculateMatrixScores(
  answers: Record<string, AnswerValue>
): MatrixScores {
  // Helper to get score from answer (either text or index)
  const getScoreFromAnswer = (
    questionId: string,
    answer: AnswerValue
  ): number => {
    const question = miniAssessmentQuestions.find(
      (q: any) => q.id === questionId
    );
    if (!question) return 1; // Default score if question not found

    // If answer is already a number (index), use it directly
    if (typeof answer === 'number') {
      return Math.max(0, Math.min(3, answer)); // Ensure it's in 0-3 range
    }

    // If answer is a string, find its index in options (backward compatibility)
    if (typeof answer === 'string') {
      // Check both options and optionKeys for backward compatibility
      const optionsArray = question.options || question.optionKeys;
      if (optionsArray) {
        const optionIndex = optionsArray.indexOf(answer);
        if (optionIndex !== -1) return optionIndex;
      }
      return 1; // Default if answer not found
    }

    return 1; // Default score for other types
  };

  // Calculate average score for each category (2 questions per category)
  const calculateCategoryScore = (questionIds: string[]): number => {
    const scores = questionIds
      .map((id) => {
        const answer = answers[id];
        return answer !== undefined ? getScoreFromAnswer(id, answer) : null;
      })
      .filter((score): score is number => score !== null);

    if (scores.length === 0) return 50; // Default score

    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    // Convert 0-3 scale to 30-70 range
    return Math.round(30 + (average / 3) * 40);
  };

  // Category mapping based on question ID patterns
  // This is dynamic - if questions change, the mapping still works
  const categoryQuestions = {
    cat1: miniAssessmentQuestions
      .filter((q: any) => q.id.includes('vitality'))
      .map((q: any) => q.id),
    cat2: miniAssessmentQuestions
      .filter((q: any) => q.id.includes('wisdom'))
      .map((q: any) => q.id),
    cat3: miniAssessmentQuestions
      .filter((q: any) => q.id.includes('harmony'))
      .map((q: any) => q.id),
    cat4: miniAssessmentQuestions
      .filter((q: any) => q.id.includes('spirit'))
      .map((q: any) => q.id),
    cat5: miniAssessmentQuestions
      .filter((q: any) => q.id.includes('ambition'))
      .map((q: any) => q.id),
  };

  return {
    cat1: calculateCategoryScore(categoryQuestions.cat1),
    cat2: calculateCategoryScore(categoryQuestions.cat2),
    cat3: calculateCategoryScore(categoryQuestions.cat3),
    cat4: calculateCategoryScore(categoryQuestions.cat4),
    cat5: calculateCategoryScore(categoryQuestions.cat5),
  };
}

export type AnswerValue = string | string[] | number;

export interface OnboardingState {
  variant: string | null;
  currentIndex: number;
  answers: Record<string, AnswerValue>;
  totalItems: number;
  startedAt?: number;
  completedAt?: number;
  matrixScores: MatrixScores;
}

interface OnboardingStore extends OnboardingState {
  // Actions
  setVariant: (variant: string) => void;
  setCurrentIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  setTotalItems: (total: number) => void;
  markStarted: () => void;
  markCompleted: () => void;
  calculateAndSetMatrixScores: () => void;
  resetStore: () => void;

  // Getters
  getProgress: () => number;
  hasAnswer: (questionId: string) => boolean;
  getAnswer: (questionId: string) => AnswerValue | undefined;
  getMatrixScores: () => MatrixScores;
}

const initialState: OnboardingState = {
  variant: null,
  currentIndex: 0,
  answers: {},
  totalItems: 0,
  startedAt: undefined,
  completedAt: undefined,
  matrixScores: {
    cat1: 50,
    cat2: 50,
    cat3: 50,
    cat4: 50,
    cat5: 50,
  },
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
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

      calculateAndSetMatrixScores: () => {
        const state = get();
        const matrixScores = calculateMatrixScores(state.answers);
        set({ matrixScores });
      },

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

      getMatrixScores: () => {
        const state = get();
        return state.matrixScores;
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => onboardingStorageAdapter),
      partialize: (state) => ({
        variant: state.variant,
        answers: state.answers,
        matrixScores: state.matrixScores,
        completedAt: state.completedAt,
        startedAt: state.startedAt,
        currentIndex: state.currentIndex,
        totalItems: state.totalItems,
      }),
    }
  )
);
