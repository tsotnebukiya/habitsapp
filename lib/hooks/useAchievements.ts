import { useCallback } from 'react';
import { useAchievementsStore } from '../stores/achievements_store';
import {
  calculateCurrentStreak,
  calculateNewAchievements,
  calculateAchievementsToRemove,
  getNewlyUnlockedAchievements,
  getAchievementDetails,
} from '../utils/achievement_scoring';
import { Database } from '../utils/supabase_types';

type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

/**
 * Hook to get all achievements
 */
export const useAllAchievements = () => {
  const achievements = useAchievementsStore((state) =>
    state.getStreakAchievements()
  );
  return achievements;
};

/**
 * Hook to get achievement status for a specific streak length
 */
export const useAchievementStatus = (days: number) => {
  const achievements = useAchievementsStore((state) =>
    state.getStreakAchievements()
  );
  return achievements[days as keyof typeof achievements] || false;
};

/**
 * Hook to calculate and update achievements based on completions
 */
export const useAchievementCalculator = () => {
  const streakAchievements = useAchievementsStore((state) =>
    state.getStreakAchievements()
  );
  const updateAchievements = useAchievementsStore(
    (state) => state.updateAchievements
  );

  const calculateAndUpdate = useCallback(
    (completions: Map<string, HabitCompletion>) => {
      // Calculate current streak across all habits

      const currentStreak = calculateCurrentStreak(completions);
      // Calculate new achievements based on streak
      const newAchievements = calculateNewAchievements(
        currentStreak,
        streakAchievements
      );
      // Calculate achievements to remove (if streak is broken)
      const achievementsAfterRemoval = calculateAchievementsToRemove(
        currentStreak,
        newAchievements
      );
      console.log('current', achievementsAfterRemoval);
      // Get list of newly unlocked achievements
      const unlockedAchievements = getNewlyUnlockedAchievements(
        streakAchievements,
        achievementsAfterRemoval
      );
      // If there are changes, update achievements
      if (
        JSON.stringify(streakAchievements) !==
        JSON.stringify(achievementsAfterRemoval)
      ) {
        updateAchievements(achievementsAfterRemoval);

        // Log newly unlocked achievements (will be replaced with modal)
        unlockedAchievements.forEach((achievementId) => {
          const achievement = getAchievementDetails(achievementId);
          console.log(
            `🎉 Achievement Unlocked: ${achievement.name}\n${achievement.description}`
          );
        });
      }

      return {
        currentStreak,
        unlockedAchievements,
      };
    },
    [streakAchievements, updateAchievements]
  );

  return {
    calculateAndUpdate,
  };
};

/**
 * Hook to get current streak
 */
export const useCurrentStreak = () => {
  const getCurrentStreak = useCallback(
    (completions: Map<string, HabitCompletion>) => {
      return calculateCurrentStreak(completions);
    },
    []
  );

  return getCurrentStreak;
};
