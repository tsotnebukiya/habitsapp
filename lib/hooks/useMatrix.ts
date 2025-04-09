import { useMemo } from 'react';
import { useUserProfileStore } from '@/lib/stores/user_profile';
import { calculateDMS, DisplayedMatrixScore } from '@/lib/utils/scoring';
import { useHabitsStore } from '@/lib/stores/habits_store';
import { CATEGORIES, CATEGORY_IDS } from '@/lib/constants/HabitTemplates';
import dayjs from 'dayjs';

export interface MatrixCategory {
  id: (typeof CATEGORY_IDS)[number] | 'total';
  name: string;
  score: number;
  color: string;
  icon: string;
  description?: string;
}

export function useMatrix() {
  // Only extract the data we need from stores as stable references
  const profile = useUserProfileStore((state) => state.profile);

  // Improving memoization by getting specific values from the store
  // instead of creating new arrays on every render
  const habitsMap = useHabitsStore((state) => state.habits);
  const completionsMap = useHabitsStore((state) => state.completions);

  // Convert maps to arrays only when the maps change
  const habits = useMemo(() => Array.from(habitsMap.values()), [habitsMap]);

  const completions = useMemo(
    () => Array.from(completionsMap.values()),
    [completionsMap]
  );

  // Calculate the displayed matrix score
  const matrixScore: DisplayedMatrixScore = useMemo(() => {
    if (!profile) {
      return {
        body: 50,
        mind: 50,
        heart: 50,
        spirit: 50,
        work: 50,
        calculated_at: new Date(),
      };
    }

    return calculateDMS(profile, habits, completions);
  }, [profile, habits, completions]);

  // Create category objects with metadata - only recompute when matrixScore changes
  const categories: MatrixCategory[] = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        score: Math.round(matrixScore[cat.id]),
      })),
    [matrixScore]
  );

  // Calculate overall balance score (average of all categories) - rounded to whole number
  const balanceScore = useMemo(() => {
    const sum = categories.reduce((acc, cat) => acc + cat.score, 0);
    return Math.round(sum / categories.length);
  }, [categories]);

  // Create balance category - only recompute when balanceScore changes
  const balanceCategory: MatrixCategory = useMemo(
    () => ({
      id: 'total',
      name: 'Total',
      score: balanceScore,
      color: '#FFBE0B', // Gold/Yellow
      icon: 'stats-chart',
      description: 'Overall life balance',
    }),
    [balanceScore]
  );

  // Add lastCalculated using dayjs for consistent date formatting
  const lastCalculated = dayjs(matrixScore.calculated_at).format();

  // Return memoized result to prevent unnecessary re-renders
  return useMemo(
    () => ({
      categories,
      balanceCategory,
      balanceScore,
      lastCalculated,
    }),
    [categories, balanceCategory, balanceScore, lastCalculated]
  );
}
