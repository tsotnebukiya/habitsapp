import { useMemo, useEffect, useRef } from 'react';
import { useUserProfileStore } from '@/lib/stores/user_profile';
import { DisplayedMatrixScore } from '@/lib/stores/habits/types';
import { CATEGORIES, CATEGORY_IDS } from '@/lib/constants/HabitTemplates';
import dayjs from '@/lib/utils/dayjs';
import useHabitsStore from '@/lib/stores/habits/store';

export interface MatrixCategory {
  id: (typeof CATEGORY_IDS)[number] | 'total';
  name: string;
  score: number;
  color: string;
  icon: string;
  description?: string;
}

export function useMatrix() {
  // Extract category values directly from the achievements store
  const cat1 = useHabitsStore((state) => state.cat1);
  const cat2 = useHabitsStore((state) => state.cat2);
  const cat3 = useHabitsStore((state) => state.cat3);
  const cat4 = useHabitsStore((state) => state.cat4);
  const cat5 = useHabitsStore((state) => state.cat5);

  // Fallback to profile only if needed
  const profile = useUserProfileStore((state) => state.profile);

  // Cache the matrix scores to avoid recalculation
  const matrixScore = useMemo<DisplayedMatrixScore>(
    () => ({
      cat1: cat1 || profile?.cat1 || 50,
      cat2: cat2 || profile?.cat2 || 50,
      cat3: cat3 || profile?.cat3 || 50,
      cat4: cat4 || profile?.cat4 || 50,
      cat5: cat5 || profile?.cat5 || 50,
      calculated_at: dayjs().toDate(),
    }),
    [cat1, cat2, cat3, cat4, cat5]
  );

  // Create category objects with metadata - only recompute when matrixScore changes
  const categories: MatrixCategory[] = useMemo(() => {
    const result = CATEGORIES.map((cat) => ({
      ...cat,
      score: Math.round(matrixScore[cat.id]),
    }));
    return result;
  }, [matrixScore]);

  // Calculate overall balance score (average of all categories) - rounded to whole number
  const balanceScore = useMemo(() => {
    const sum = categories.reduce((acc, cat) => acc + cat.score, 0);
    const result = Math.round(sum / categories.length);
    return result;
  }, [categories]);

  // Create balance category - only recompute when balanceScore changes
  const balanceCategory: MatrixCategory = useMemo(
    () => ({
      id: 'total',
      name: 'Total',
      score: balanceScore,
      color: '#FFBE0B', // Gold/Yellow
      // emoji for balance
      icon: '💰',
      description: 'Overall life balance',
    }),
    [balanceScore]
  );

  // Add lastCalculated using dayjs for consistent date formatting
  const lastCalculated = useMemo(
    () => dayjs(matrixScore.calculated_at).format(),
    [matrixScore.calculated_at]
  );

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
