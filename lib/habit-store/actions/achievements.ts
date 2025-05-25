import { useModalStore } from '@/lib/stores/modal_store';
import { useUserProfileStore } from '@/lib/stores/user_profile';
import {
  calculateCurrentStreak,
  calculateDMS,
  calculateNewAchievements,
  getNewlyUnlockedAchievements,
} from '@/lib/utils/achievements';
import { dateUtils } from '@/lib/utils/dayjs';
import { getUserIdOrThrow } from '@/lib/utils/habits';
import { supabase } from '@/supabase/client';
import { StateCreator } from 'zustand';
import {
  HabitCompletion,
  SharedSlice,
  StreakAchievements,
  StreakDays,
  UserAchievement,
} from '../types';

export interface AchievementSlice {
  streakAchievements: StreakAchievements;
  currentStreak: number;
  maxStreak: number;
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;

  resetAchievements: () => void;
  setAchievements: (achievements: UserAchievement) => void;
  getCurrentStreak: () => number;
  getTotalCompletions: () => number;
  getSuccessRate: () => number;
  calculateAndUpdate: () => {
    unlockedAchievements: StreakDays[];
  };
}

export const createAchievementSlice: StateCreator<
  SharedSlice,
  [],
  [],
  AchievementSlice
> = (set, get) => ({
  streakAchievements: {},
  currentStreak: 0,
  maxStreak: 0,
  cat1: 50,
  cat2: 50,
  cat3: 50,
  cat4: 50,
  cat5: 50,
  pendingOperations: [],

  setAchievements: (achievements) => {
    const now = dateUtils.nowUTC();

    // Update local state immediately
    set({
      cat1: achievements.cat1 || 50,
      cat2: achievements.cat2 || 50,
      cat3: achievements.cat3 || 50,
      cat4: achievements.cat4 || 50,
      cat5: achievements.cat5 || 50,
      streakAchievements:
        achievements.streak_achievements as StreakAchievements,
      currentStreak: achievements.current_streak,
      maxStreak: achievements.max_streak,
    });

    // Fire and forget server update
    supabase
      .from('user_achievements')
      .upsert(achievements)
      .then(({ error }) => {
        if (error) {
          const pendingOp = {
            id: achievements.id,
            type: 'update' as const,
            table: 'user_achievements' as const,
            data: achievements,
            timestamp: now.toDate(),
            retryCount: 0,
            lastAttempt: now.toDate(),
          };
          set((state) => ({
            pendingOperations: [...state.pendingOperations, pendingOp],
          }));
        }
      });
  },
  getCurrentStreak: () => {
    const currentStreak = calculateCurrentStreak(
      get().completions,
      get().habits
    );
    return currentStreak;
  },

  calculateAndUpdate: () => {
    const { profile } = useUserProfileStore.getState();
    if (!profile) {
      return { unlockedAchievements: [] };
    }

    // Capture old achievements before updating state
    const oldAchievements = get().streakAchievements;

    const currentStreak = calculateCurrentStreak(
      get().completions,
      get().habits
    );

    const newAchievements = calculateNewAchievements(
      currentStreak,
      oldAchievements
    );
    const matrixScores = calculateDMS(
      profile,
      Array.from(get().habits.values()),
      Array.from(get().completions.values())
    );

    const userId = getUserIdOrThrow();
    const now = dateUtils.nowUTC();
    const userAchievement: UserAchievement = {
      id: userId,
      user_id: userId,
      cat1: matrixScores.cat1 || profile.cat1,
      cat2: matrixScores.cat2 || profile.cat2,
      cat3: matrixScores.cat3 || profile.cat3,
      cat4: matrixScores.cat4 || profile.cat4,
      cat5: matrixScores.cat5 || profile.cat5,
      streak_achievements: newAchievements,
      current_streak: currentStreak,
      max_streak: Math.max(currentStreak, get().maxStreak),
      created_at: dateUtils.toServerDateTime(now),
      updated_at: dateUtils.toServerDateTime(now),
    };

    // Update local state
    set({
      cat1: userAchievement.cat1 || profile.cat1 || undefined,
      cat2: userAchievement.cat2 || profile.cat2 || undefined,
      cat3: userAchievement.cat3 || profile.cat3 || undefined,
      cat4: userAchievement.cat4 || profile.cat4 || undefined,
      cat5: userAchievement.cat5 || profile.cat5 || undefined,
      streakAchievements: newAchievements,
      currentStreak,
      maxStreak: userAchievement.max_streak,
    });

    supabase
      .from('user_achievements')
      .upsert(userAchievement)
      .then(({ error }) => {
        if (error) {
          const pendingOp = {
            id: userAchievement.id,
            type: 'update' as const,
            table: 'user_achievements' as const,
            data: userAchievement,
            timestamp: now.toDate(),
            retryCount: 0,
            lastAttempt: now.toDate(),
          };
          set((state) => ({
            pendingOperations: [...state.pendingOperations, pendingOp],
          }));
        }
      });

    // Use the captured old achievements for comparison
    const unlockedAchievements = getNewlyUnlockedAchievements(
      oldAchievements,
      newAchievements
    );

    // Automatically show modal if there are unlocked achievements
    if (unlockedAchievements.length > 0) {
      useModalStore.getState().showAchievementModal(unlockedAchievements);
    }

    return { unlockedAchievements };
  },

  resetAchievements: () => {
    const userId = getUserIdOrThrow();
    const now = dateUtils.nowUTC();

    // Update local state immediately
    set({
      streakAchievements: {},
      currentStreak: 0,
      maxStreak: 0,
      cat1: 50,
      cat2: 50,
      cat3: 50,
      cat4: 50,
      cat5: 50,
    });
    setTimeout(() => {
      console.log('currentStreaks', get().streakAchievements);
      const { unlockedAchievements } = get().calculateAndUpdate();
      console.log(unlockedAchievements, 'newStreaks');
    }, 100);
    // Delete from server in the background
    supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) {
          const pendingOp = {
            id: userId,
            type: 'delete' as const,
            table: 'user_achievements' as const,
            timestamp: now.toDate(),
            retryCount: 0,
            lastAttempt: now.toDate(),
          };
          set((state) => ({
            pendingOperations: [...state.pendingOperations, pendingOp],
          }));
        }
      });
  },

  getTotalCompletions: () => {
    const completions = Array.from(get().completions.values());
    return completions.filter((completion) => completion.status === 'completed')
      .length;
  },

  getSuccessRate: () => {
    const habits = Array.from(get().habits.values());
    const completions = Array.from(get().completions.values());

    if (habits.length === 0) {
      return 0;
    }

    // Create a map of completions by habit and date for fast lookup
    const completionsByHabitAndDate = new Map<
      string,
      Map<string, HabitCompletion>
    >();
    completions.forEach((completion) => {
      if (!completionsByHabitAndDate.has(completion.habit_id)) {
        completionsByHabitAndDate.set(completion.habit_id, new Map());
      }
      completionsByHabitAndDate
        .get(completion.habit_id)!
        .set(completion.completion_date, completion);
    });

    let totalExpectedDays = 0;
    let totalSuccessfulDays = 0;

    const today = dateUtils.normalizeLocal(dateUtils.today());

    // Calculate for each habit
    habits.forEach((habit) => {
      if (!habit.is_active) return;

      const startDate = dateUtils.normalizeLocal(
        habit.start_date || habit.created_at
      );
      const endDate = habit.end_date
        ? dateUtils.normalizeLocal(habit.end_date)
        : today;

      // Don't count future dates
      const actualEndDate = endDate.isAfter(today) ? today : endDate;

      if (startDate.isAfter(actualEndDate)) return;

      const habitCompletions =
        completionsByHabitAndDate.get(habit.id) || new Map();

      // Iterate through each day from start to end
      let currentDate = startDate.clone();
      while (currentDate.isSameOrBefore(actualEndDate, 'day')) {
        const dayOfWeek = currentDate.day(); // 0 = Sunday, 1 = Monday, etc.
        const dateString = currentDate.format('YYYY-MM-DD');

        // Check if this habit should be active on this day
        let shouldBeActive = true;

        if (habit.frequency_type === 'weekly' && habit.days_of_week) {
          shouldBeActive = habit.days_of_week.includes(dayOfWeek);
        }

        if (shouldBeActive) {
          totalExpectedDays++;

          const completion = habitCompletions.get(dateString);

          // Count as successful if completed or skipped
          if (
            completion &&
            (completion.status === 'completed' ||
              completion.status === 'skipped')
          ) {
            totalSuccessfulDays++;
          }
          // If no completion record exists, it's considered a failure (not attempted)
        }

        currentDate = currentDate.add(1, 'day');
      }
    });

    if (totalExpectedDays === 0) {
      return 0;
    }
    return Math.round((totalSuccessfulDays / totalExpectedDays) * 100);
  },
});
