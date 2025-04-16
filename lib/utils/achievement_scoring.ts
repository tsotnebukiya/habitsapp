import { StreakDays, ACHIEVEMENTS } from '../constants/achievements';
import { dateUtils } from './dayjs';
import { Habit } from './habits';
import { HabitCompletion } from './habits';

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
  // Early return for empty cases
  if (completions.size === 0 || habits.size === 0) return 0;

  // Pre-process: Normalize dates and create lookup structures
  const today = dateUtils.normalize(dateUtils.today());

  // Create a map of normalized dates to completions
  const completionsByDate = new Map<string, Set<string>>();
  const normalizedDates = new Set<string>();

  completions.forEach((completion) => {
    const normalizedDate = dateUtils
      .normalize(completion.completion_date)
      .format('YYYY-MM-DD');
    normalizedDates.add(normalizedDate);

    if (!completionsByDate.has(normalizedDate)) {
      completionsByDate.set(normalizedDate, new Set());
    }

    // Store only completed/skipped habits
    if (completion.status === 'completed' || completion.status === 'skipped') {
      completionsByDate.get(normalizedDate)!.add(completion.habit_id);
    }
  });

  // Pre-calculate habit activity periods
  type HabitPeriod = { id: string; start: string; end: string | null };
  const habitPeriods: HabitPeriod[] = Array.from(habits.values()).map(
    (habit) => ({
      id: habit.id,
      start: dateUtils.normalize(habit.created_at).format('YYYY-MM-DD'),
      end: habit.end_date
        ? dateUtils.normalize(habit.end_date).format('YYYY-MM-DD')
        : null,
    })
  );

  // Sort dates once, in descending order
  const sortedDates = Array.from(normalizedDates).sort((a, b) =>
    b.localeCompare(a)
  );

  let currentStreak = 0;
  let previousDate = today.format('YYYY-MM-DD');

  // Calculate streak
  for (const date of sortedDates) {
    // Break streak if there's a gap
    const daysDiff = dateUtils
      .normalize(previousDate)
      .diff(dateUtils.normalize(date), 'day');

    if (daysDiff > 1) break;

    // Get active habits for this date
    const activeHabits = habitPeriods.filter(({ start, end }) => {
      const isAfterStart = date >= start;
      const isBeforeEnd = !end || date <= end;
      return isAfterStart && isBeforeEnd;
    });

    // Skip dates with no active habits
    if (activeHabits.length === 0) {
      previousDate = date;
      continue;
    }

    // Get completed habits for this date
    const completedHabits = completionsByDate.get(date) || new Set();

    // Check if all active habits are completed
    const allCompleted = activeHabits.every((habit) =>
      completedHabits.has(habit.id)
    );

    if (!allCompleted) break;

    currentStreak++;
    previousDate = date;
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
