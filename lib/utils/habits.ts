import { MeasurementUnits } from '@/lib/constants/MeasurementUnits';
import {
  Habit,
  HabitAction,
  HabitCompletion,
  SharedSlice,
} from '@/lib/habit-store/types';
import useUserProfileStore from '@/lib/stores/user_profile';
import { Database } from '@/supabase/types';
import { syncStoreToWidget } from '../habit-store/widget-storage';
import dayjs, { dateUtils } from './dayjs';

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
  // Use local time for all date operations to avoid timezone conversion issues
  const startDate = dayjs(habit.start_date).startOf('day');
  const today = dateUtils.today();
  const endDate = habit.end_date
    ? dayjs(habit.end_date).startOf('day').isBefore(today)
      ? dayjs(habit.end_date).startOf('day')
      : today
    : today;

  const dates: string[] = [];

  if (habit.frequency_type === 'weekly' && habit.days_of_week) {
    let currentDate = startDate;
    const daysOfWeek = new Set(habit.days_of_week);

    while (currentDate.isSameOrBefore(endDate)) {
      const dayOfWeek = currentDate.day();

      if (daysOfWeek.has(dayOfWeek)) {
        dates.push(currentDate.format('YYYY-MM-DD'));
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

      currentDate = currentDate.add(daysToAdd, 'day');
    }
  } else {
    let currentDate = startDate;
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }
  }

  return dates.map((dateStr) => dayjs(dateStr).toDate());
};

/**
 * Normalizes a date to YYYY-MM-DD format in local time for user-facing operations
 */
export const normalizeDate = (date: Date | string): string => {
  return dateUtils.toLocalDateString(date);
};

/**
 * Calculates the overall completion status for a specific date
 * All date comparisons are done in local time for user-facing operations
 */
export const calculateDateStatus = (
  allHabits: Habit[],
  allCompletions: HabitCompletion[],
  date: Date
): number => {
  if (!allHabits || allHabits.length === 0) return 0;

  const targetDateNormalized = dateUtils.normalizeLocal(date);
  const targetDayOfWeek = targetDateNormalized.day();
  const targetDateString = dateUtils.toLocalDateString(date);
  const activeHabitsForDate: Habit[] = [];

  for (const habit of allHabits) {
    if (!habit.is_active) continue;

    const startDate = dateUtils.normalizeLocal(habit.start_date);
    if (targetDateNormalized.isBefore(startDate)) continue;

    if (habit.end_date) {
      const endDate = dateUtils.normalizeLocal(habit.end_date);
      if (targetDateNormalized.isAfter(endDate)) continue;
    }

    if (habit.frequency_type === 'weekly') {
      if (!habit.days_of_week?.includes(targetDayOfWeek)) continue;
    }

    activeHabitsForDate.push(habit);
  }

  if (activeHabitsForDate.length === 0) return 0;

  let sumOfIndividualRates = 0;

  for (const habit of activeHabitsForDate) {
    const maxGoalValue = habit.goal_value || habit.completions_per_day || 1;

    const completionRecord = allCompletions.find(
      (comp) =>
        comp.habit_id === habit.id && comp.completion_date === targetDateString
    );

    // Skip this habit if it's marked as skipped
    if (completionRecord?.status === 'skipped') continue;

    const achievedValue = completionRecord?.value || 0;

    // Ensure achievedValue is not negative, though it should be handled by input.
    const normalizedAchievedValue = Math.max(0, achievedValue);

    let individualRate = 0;
    if (maxGoalValue > 0) {
      individualRate = Math.min(1, normalizedAchievedValue / maxGoalValue);
    } else if (normalizedAchievedValue > 0) {
      // If maxGoalValue is 0 or undefined but there's an achieved value, consider it completed.
      individualRate = 1;
    }
    sumOfIndividualRates += individualRate;
  }

  // Adjust the denominator to exclude skipped habits
  const activeNonSkippedHabits = activeHabitsForDate.filter((habit) => {
    const completionRecord = allCompletions.find(
      (comp) =>
        comp.habit_id === habit.id && comp.completion_date === targetDateString
    );
    return completionRecord?.status !== 'skipped';
  });

  return activeNonSkippedHabits.length > 0
    ? sumOfIndividualRates / activeNonSkippedHabits.length
    : 0;
};

export const getUserIdOrThrow = () => {
  const userId = useUserProfileStore.getState().profile?.id;
  if (!userId) throw new Error('User not logged in');
  return userId;
};

/**
 * Rounds a number to a specified number of decimal places to avoid floating-point precision issues
 */
const roundToDecimalPlaces = (value: number, places: number = 2): number => {
  return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
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
  // Round stepSize to nearest integer to avoid decimal increments
  const stepSize = Math.round(
    habit.goal_value ? Math.max(habit.goal_value * 0.1, 1) : 1
  );
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

  // Round newValue to prevent floating-point precision issues
  newValue = roundToDecimalPlaces(newValue);

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
 * Gets the completion status for a specific habit on a specific date
 * Uses local time for date comparison to match stored completion dates
 */
export const getHabitStatus = (
  completions: HabitCompletion[],
  habitId: string,
  date: Date
): HabitCompletion | null => {
  const normalizedDate = normalizeDate(date);
  return (
    completions.find(
      (completion) =>
        completion.habit_id === habitId &&
        completion.completion_date === normalizedDate
    ) || null
  );
};

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
  console.log('habit', currentValue);
  if (habit.goal_value && habit.goal_unit) {
    const unit = MeasurementUnits[habit.goal_unit];
    const unitName = habit.goal_value === 1 ? unit.oneName : unit.name;
    if (unit) {
      return `${currentValue}/${
        habit.goal_value
      } ${unitName.toLocaleLowerCase()}`;
    }
    return `${currentValue}/${habit.goal_value}`;
  } else if (habit.completions_per_day > 1) {
    return `${currentValue}/${habit.completions_per_day}`;
  }

  return `${currentValue}/1`;
}

/**
 * Sorts habits by their sort_id in ascending order
 * If sort_id is not available, falls back to creation date
 */
export function sortHabits<
  T extends { sort_id: number | null; created_at: string }
>(habits: T[]): T[] {
  return [...habits].sort((a, b) => {
    // If both have sort_id, use that
    if (a.sort_id !== null && b.sort_id !== null) {
      return a.sort_id - b.sort_id;
    }
    // If one has sort_id and other doesn't, prioritize the one with sort_id
    if (a.sort_id !== null) return -1;
    if (b.sort_id !== null) return 1;
    // If neither has sort_id, fall back to creation date
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export const handlePostActionOperations = (
  get: () => SharedSlice,
  habitId: string,
  affectedDates?: Date[]
) => {
  // Priority 1: Update affected dates (1ms delay - immediate but non-blocking)
  setTimeout(() => {
    get().updateAffectedDates(habitId, affectedDates);
  }, 1);

  // Priority 2: Calculate and update (50ms delay - after UI updates)
  setTimeout(() => {
    get().calculateAndUpdate();
  }, 50);

  // Priority 3: Sync to widget (100ms delay - lowest priority)
  setTimeout(() => {
    syncStoreToWidget(get().habits, get().completions);
  }, 100);
};
