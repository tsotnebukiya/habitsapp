import { dateUtils } from './dayjs';
import { Database } from '@/supabase/types';
import {
  CompletionStatus,
  Habit,
  HabitAction,
  HabitCompletion,
} from '@/habits-store/types';
import useUserProfileStore from '@/lib/stores/user_profile';

export const STORE_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  MIN_RETRY_INTERVAL: 1000 * 60, // 1 minute
};

/**
 * Gets a month key in the format YYYY-MM for caching purposes
 * Uses UTC to ensure consistency across timezones
 */
export const getMonthKey = (date: Date): string => {
  return dateUtils.toUTC(date).format('YYYY-MM');
};

/**
 * Gets all dates that are affected by a habit based on its frequency and date range
 * All dates are handled in UTC to ensure consistency
 */
export const getAffectedDates = (habit: Habit): Date[] => {
  const startDate = dateUtils.normalize(habit.start_date);
  const today = dateUtils.todayUTC();
  const endDate = habit.end_date
    ? dateUtils.normalize(habit.end_date).isBefore(today)
      ? dateUtils.normalize(habit.end_date)
      : today
    : today;

  const dates: string[] = [];

  if (habit.frequency_type === 'weekly' && habit.days_of_week) {
    let currentDate = startDate;
    const daysOfWeek = new Set(habit.days_of_week);

    while (currentDate.isSameOrBefore(endDate)) {
      const dayOfWeek = currentDate.day();

      if (daysOfWeek.has(dayOfWeek)) {
        dates.push(dateUtils.toServerDateString(currentDate));
      }

      let nextDay = dayOfWeek + 1;
      let daysToAdd = 1;

      while (nextDay <= 6) {
        if (daysOfWeek.has(nextDay)) {
          break;
        }
        nextDay++;
        daysToAdd++;
      }

      if (nextDay > 6) {
        const firstValidDay = Math.min(...Array.from(daysOfWeek));
        daysToAdd = 7 - dayOfWeek + firstValidDay;
      }

      currentDate = dateUtils.addDays(currentDate, daysToAdd);
    }
  } else {
    let currentDate = startDate;
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(dateUtils.toServerDateString(currentDate));
      currentDate = dateUtils.addDays(currentDate, 1);
    }
  }

  return dates.map((dateStr) => dateUtils.fromServerDate(dateStr).toDate());
};

/**
 * Normalizes a date to YYYY-MM-DD format in UTC
 */
export const normalizeDate = (date: Date | string): string => {
  return dateUtils.toServerDateString(date);
};

/**
 * Gets the completion status for a specific habit on a specific date
 * Uses UTC for date comparison
 */
export const getHabitStatus = (
  completions: HabitCompletion[],
  habitId: string,
  date: Date
): HabitCompletion | null => {
  const normalizedDate = dateUtils.toServerDateString(date);
  return (
    completions.find(
      (completion) =>
        completion.habit_id === habitId &&
        completion.completion_date === normalizedDate
    ) || null
  );
};

/**
 * Calculates the overall completion status for a specific date
 * All date comparisons are done in UTC
 */
export const calculateDateStatus = (
  allHabits: Habit[],
  allCompletions: HabitCompletion[],
  date: Date
): CompletionStatus => {
  if (!allHabits || !allCompletions) return 'none_completed';

  const targetDateNormalized = dateUtils.normalize(date);
  const targetDayOfWeek = targetDateNormalized.day();
  const targetDateString = dateUtils.toServerDateString(date);

  const activeHabitsForDate: Habit[] = [];

  for (const habit of allHabits) {
    if (!habit.is_active) continue;

    const startDate = dateUtils.normalize(habit.start_date);
    if (targetDateNormalized.isBefore(startDate)) continue;

    if (habit.end_date) {
      const endDate = dateUtils.normalize(habit.end_date);
      if (targetDateNormalized.isAfter(endDate)) continue;
    }

    if (habit.frequency_type === 'weekly') {
      if (!habit.days_of_week?.includes(targetDayOfWeek)) continue;
    }

    activeHabitsForDate.push(habit);
  }

  if (activeHabitsForDate.length === 0) return 'none_completed';

  const completionsForDateMap = new Map<string, HabitCompletion['status']>();

  for (const completion of allCompletions) {
    if (completion.completion_date === targetDateString) {
      completionsForDateMap.set(completion.habit_id, completion.status);
    }
  }

  let completedCount = 0;
  let inProgressCount = 0;

  for (const habit of activeHabitsForDate) {
    const status = completionsForDateMap.get(habit.id);

    if (status === 'completed' || status === 'skipped') {
      completedCount++;
    } else if (status === 'in_progress') {
      inProgressCount++;
    }
  }

  if (completedCount === activeHabitsForDate.length) {
    return 'all_completed';
  } else if (completedCount > 0 || inProgressCount > 0) {
    return 'some_completed';
  }

  return 'none_completed';
};

export const getUserIdOrThrow = () => {
  const userId = useUserProfileStore.getState().profile?.id;
  if (!userId) throw new Error('User not logged in');
  return userId;
};

/**
 * Calculate new value and status for a habit based on the action taken
 */
export function calculateHabitToggle({
  habit,
  date,
  action,
  value,
  completions,
}: {
  habit: Habit;
  date: Date;
  action: HabitAction;

  value?: number;
  completions: HabitCompletion[];
}): {
  newValue: number;
  newStatus: Database['public']['Enums']['habit_completion_status'];
} {
  const normalizedDate = normalizeDate(date);
  const existingCompletion = completions.find(
    (completion) =>
      completion.habit_id === habit.id &&
      completion.completion_date === normalizedDate
  );

  let newValue = 0;
  const maxValue = habit.goal_value || habit.completions_per_day || 1;
  const stepSize = habit.goal_value ? Math.max(habit.goal_value * 0.1, 1) : 1;
  const currentValue = existingCompletion?.value || 0;
  const currentStatus = existingCompletion?.status || 'not_started';

  switch (action) {
    case 'toggle':
      if (currentStatus === 'not_started') {
        if (maxValue === 1) {
          newValue = 1;
        } else {
          newValue = stepSize;
        }
      } else if (currentStatus === 'in_progress') {
        newValue = Math.min(currentValue + stepSize, maxValue);
      } else {
        newValue = 0;
      }
      break;

    case 'set_value':
      if (value === undefined)
        return { newValue: currentValue, newStatus: currentStatus };
      newValue = Math.max(0, Math.min(value, maxValue));
      break;

    case 'toggle_skip':
      newValue = 0;
      break;

    case 'toggle_complete':
      newValue = currentStatus === 'completed' ? 0 : maxValue;
      break;
  }

  // Special case for skip action
  const newStatus =
    action === 'toggle_skip'
      ? currentStatus === 'skipped'
        ? 'not_started'
        : 'skipped'
      : newValue >= maxValue
      ? 'completed'
      : newValue > 0
      ? 'in_progress'
      : 'not_started';

  return { newValue, newStatus };
}

/**
 * Gets the current value for a habit on a specific date
 */
export function getCurrentValue(
  completions: HabitCompletion[],
  habitId: string,
  date: Date
): number {
  const normalizedDate = normalizeDate(date);
  const completion = completions.find(
    (completion) =>
      completion.habit_id === habitId &&
      completion.completion_date === normalizedDate
  );
  return completion?.value || 0;
}

/**
 * Calculates the progress percentage for a habit on a specific date
 */
export function getCurrentProgress(habit: Habit, currentValue: number): number {
  if (!habit) return 0;

  if (habit.goal_value) {
    return Math.min(currentValue / habit.goal_value, 1);
  } else if (habit.completions_per_day > 1) {
    return Math.min(currentValue / habit.completions_per_day, 1);
  }

  return currentValue > 0 ? 1 : 0;
}

/**
 * Formats the progress text for a habit based on its current value and settings
 */
export function getProgressText(habit: Habit, currentValue: number): string {
  if (!habit) return '0/1';

  if (habit.goal_value && habit.goal_unit) {
    return `${currentValue}/${habit.goal_value}${habit.goal_unit}`;
  } else if (habit.completions_per_day > 1) {
    return `${currentValue}/${habit.completions_per_day}`;
  }

  return `${currentValue}/1`;
}
