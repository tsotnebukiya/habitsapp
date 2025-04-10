// get all achievements

import { useMemo } from 'react';
import { useAchievementsStore } from '../stores/achievements_store';
import { useHabitsStore } from '../stores/habits_store';
import { StreakAchievements } from '../utils/achievement_scoring';
import { Database } from '../utils/supabase_types';
import { calculateCurrentStreak } from '../utils/achievement_scoring';

type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

export const useAllAchievements = (): StreakAchievements => {
  const achievements = useAchievementsStore((state) =>
    state.getStreakAchievements()
  );
  return useMemo(() => {
    return achievements;
  }, [achievements]);
};

export const useCurrentStreak = () => {
  const completions = useHabitsStore((state) => state.getCompletions());
  return useMemo(() => {
    return calculateCurrentStreak(completions);
  }, [completions]);
};
