import { StreakDays, ACHIEVEMENTS } from '../constants/achievements';
import { Database } from './supabase_types';
import dayjs from 'dayjs';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

export type StreakAchievements = {
  [K in StreakDays]?: boolean;
};

/**
 * Calculate the current streak based on daily habit completions
 * A day is considered complete if ALL active habits for that day are completed
 */
export function calculateCurrentStreak(
  completions: Map<string, HabitCompletion>,
  habits: Map<string, Habit>
): number {
  if (completions.size === 0) return 0;

  // Group completions by date
  const completionsByDate = new Map<string, HabitCompletion[]>();
  completions.forEach((completion) => {
    const date = dayjs(completion.completion_date).format('YYYY-MM-DD');
    const dateCompletions = completionsByDate.get(date) || [];
    dateCompletions.push(completion);
    completionsByDate.set(date, dateCompletions);
  });

  // Sort dates in descending order
  const dates = Array.from(completionsByDate.keys()).sort((a, b) =>
    dayjs(b).diff(dayjs(a))
  );

  let currentStreak = 0;
  let currentDate = dayjs().startOf('day');

  // Check each date for streak
  for (const date of dates) {
    const dateToCheck = dayjs(date).startOf('day');

    // Break streak if there's a gap
    if (currentDate.diff(dateToCheck, 'day') > 1) {
      break;
    }

    // Get all habits that should be active for this date
    const activeHabitsForDate = Array.from(habits.values()).filter((habit) => {
      // Check if habit was active on this date
      const habitStartDate = dayjs(habit.created_at).startOf('day');
      const isAfterStart =
        dateToCheck.isSame(habitStartDate) ||
        dateToCheck.isAfter(habitStartDate);

      // Check if habit is still active (not archived or ended)
      const isActive =
        habit.end_date === null || dayjs(habit.end_date).isAfter(dateToCheck);

      return isAfterStart && isActive;
    });

    // Get completion records for this date
    const dateCompletions = completionsByDate.get(date) || [];

    // Create a map of habit_id to completion for quick lookup
    const habitCompletionsMap = new Map<string, HabitCompletion>();
    dateCompletions.forEach((completion) => {
      habitCompletionsMap.set(completion.habit_id, completion);
    });

    // Check if all active habits for this date are either completed or skipped
    const allHabitsCompleted = activeHabitsForDate.every((habit) => {
      const completion = habitCompletionsMap.get(habit.id);
      return (
        completion &&
        (completion.status === 'completed' || completion.status === 'skipped')
      );
    });
    if (allHabitsCompleted && activeHabitsForDate.length > 0) {
      currentStreak++;
    } else {
      break; // Break streak if not all habits completed
    }
    currentDate = dateToCheck;
  }

  return currentStreak;
}

/**
 * Determine which achievements should be unlocked based on the current streak
 */
export function calculateNewAchievements(
  currentStreak: number,
  currentAchievements: StreakAchievements
): StreakAchievements {
  // Start with current achievements
  const newAchievements = { ...currentAchievements };

  // Check each achievement threshold
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    // Only update if achievement is not already unlocked
    if (!currentAchievements[achievement.id]) {
      newAchievements[achievement.id] = currentStreak >= achievement.days;
    }
  });

  return newAchievements;
}

/**
 * Determine which achievements should be removed when streak is broken
 */
export function calculateAchievementsToRemove(
  currentStreak: number,
  currentAchievements: StreakAchievements
): StreakAchievements {
  const updatedAchievements = { ...currentAchievements };

  // Remove achievements that require longer streaks than current
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (currentStreak < achievement.days) {
      updatedAchievements[achievement.id] = false;
    }
  });

  return updatedAchievements;
}

/**
 * Get a list of newly unlocked achievements
 */
export function getNewlyUnlockedAchievements(
  oldAchievements: StreakAchievements,
  newAchievements: StreakAchievements
): StreakDays[] {
  return Object.entries(newAchievements)
    .filter(([key, value]) => {
      const days = Number(key) as StreakDays;
      // Return only achievements that are newly set to true
      return value === true && !oldAchievements[days];
    })
    .map(([key]) => Number(key) as StreakDays);
}

/**
 * Get achievement details for display
 */
export function getAchievementDetails(achievementId: StreakDays) {
  return ACHIEVEMENTS[achievementId];
}
