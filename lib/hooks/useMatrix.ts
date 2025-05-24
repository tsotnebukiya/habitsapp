import {
  CATEGORIES,
  CATEGORY_IDS,
  HabitCategory,
  TOTAL_CATEGORY,
} from '@/lib/constants/HabitTemplates';
import useHabitsStore from '@/lib/habit-store/store';
import { UserProfile, useUserProfileStore } from '@/lib/stores/user_profile';
import { useMemo } from 'react';

export interface MatrixCategory {
  id: (typeof CATEGORY_IDS)[number] | 'total';
  name: string;
  score: number;
  difference: number;
  icon: string;
  description?: string;
  display: {
    title: string;
    number: string;
    background: string;
  };
}

// Helper function to get current score from achievements store
function getCurrentScore(
  categoryId: HabitCategory,
  scores: {
    cat1?: number;
    cat2?: number;
    cat3?: number;
    cat4?: number;
    cat5?: number;
  }
): number {
  switch (categoryId) {
    case 'cat1':
      return scores.cat1 || 0;
    case 'cat2':
      return scores.cat2 || 0;
    case 'cat3':
      return scores.cat3 || 0;
    case 'cat4':
      return scores.cat4 || 0;
    case 'cat5':
      return scores.cat5 || 0;
    default:
      return 0;
  }
}

// Helper function to get baseline score from user profile
function getBaselineScore(
  categoryId: HabitCategory,
  profile: UserProfile | null
): number {
  if (!profile) return 50; // Default baseline

  switch (categoryId) {
    case 'cat1':
      return profile.cat1 || 50;
    case 'cat2':
      return profile.cat2 || 50;
    case 'cat3':
      return profile.cat3 || 50;
    case 'cat4':
      return profile.cat4 || 50;
    case 'cat5':
      return profile.cat5 || 50;
    default:
      return 50;
  }
}

export function useMatrix() {
  // Get current scores from achievements store
  const cat1 = useHabitsStore((state) => state.cat1);
  const cat2 = useHabitsStore((state) => state.cat2);
  const cat3 = useHabitsStore((state) => state.cat3);
  const cat4 = useHabitsStore((state) => state.cat4);
  const cat5 = useHabitsStore((state) => state.cat5);

  // Get baseline scores from user profile
  const profile = useUserProfileStore((state) => state.profile);

  // Calculate differences and create categories
  const categories: MatrixCategory[] = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const currentScore = getCurrentScore(cat.id, {
        cat1,
        cat2,
        cat3,
        cat4,
        cat5,
      });
      const baselineScore = getBaselineScore(cat.id, profile);
      const finalScore = currentScore || baselineScore;

      return {
        id: cat.id,
        name: cat.name,
        score: Math.round(finalScore),
        difference: Math.round(finalScore - baselineScore),
        icon: cat.icon,
        description: cat.description,
        display: cat.display,
      };
    });
  }, [cat1, cat2, cat3, cat4, cat5, profile]);

  // Calculate total with difference
  const balanceCategory: MatrixCategory = useMemo(() => {
    const totalScore = Math.round(
      categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length
    );
    const totalBaseline = Math.round(
      categories.reduce((acc, cat) => acc + (cat.score - cat.difference), 0) /
        categories.length
    );

    return {
      id: 'total',
      name: TOTAL_CATEGORY.name,
      score: totalScore,
      difference: totalScore - totalBaseline,
      icon: TOTAL_CATEGORY.icon,
      description: TOTAL_CATEGORY.description,
      display: TOTAL_CATEGORY.display,
    };
  }, [categories]);

  return { categories, balanceCategory };
}
