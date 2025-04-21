import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import { Database } from '@/supabase/types';
import {
  CompletionStatus,
  Habit,
  HabitAction,
  HabitCompletion,
} from '@/lib/stores/habits/types';
import useUserProfileStore from '@/lib/stores/user_profile';

export const STORE_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  MIN_RETRY_INTERVAL: 1000 * 60, // 1 minute
};
/**
 * Gets a month key in the format YYYY-MM for caching purposes
 */
export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
};

/**
 * Gets all dates that are affected by a habit based on its frequency and date range
 */
export const getAffectedDates = (habit: Habit): Date[] => {
  const startDate = dayjs(habit.start_date).startOf('day');
  const endDate = habit.end_date
    ? dayjs(habit.end_date).endOf('day')
    : dayjs().add(1, 'month').endOf('day');

  const dates: Date[] = [];
  let currentDate = startDate;

  while (currentDate.isSameOrBefore(endDate)) {
    if (habit.frequency_type === 'weekly' && habit.days_of_week) {
      if (habit.days_of_week.includes(currentDate.day())) {
        dates.push(currentDate.toDate());
      }
    } else {
      dates.push(currentDate.toDate());
    }
    currentDate = currentDate.add(1, 'day');
  }

  return dates;
};

/**
 * Normalizes a date to YYYY-MM-DD format
 */
export const normalizeDate = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Gets the completion status for a specific habit on a specific date
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
 * Calculates the overall completion status for a specific date
 */

export const calculateDateStatus = (
  allHabits: Habit[], // Guaranteed to be an array
  allCompletions: HabitCompletion[], // Guaranteed to be an array
  date: Date
): CompletionStatus => {
  // 1. Pre-normalize target date and get its properties ONCE
  const targetDateNormalized = dayjs(date).startOf('day');
  const targetDayOfWeek = targetDateNormalized.day(); // 0 (Sun) - 6 (Sat)
  const targetDateString = targetDateNormalized.format('YYYY-MM-DD'); // For completion lookup

  // 2. Single pass filtering to get active habits for the specific date
  const activeHabitsForDate: Habit[] = [];

  for (const habit of allHabits) {
    // Directly iterate over the input array
    // --- Start Combined Filtering Logic ---

    // a. Check is_active (Early exit)
    if (!habit.is_active) {
      continue;
    }

    // b. Check date range (using pre-normalized target date)
    const startDate = dayjs(habit.start_date).startOf('day');
    if (targetDateNormalized.isBefore(startDate)) {
      continue; // Target date is before habit started
    }
    if (habit.end_date) {
      const endDate = dayjs(habit.end_date).startOf('day');
      if (targetDateNormalized.isAfter(endDate)) {
        continue; // Target date is after habit ended
      }
    }
    // Habit is active during the target date range

    // c. Check frequency
    if (habit.frequency_type === 'weekly') {
      // Ensure days_of_week exists and includes the target day
      if (!habit.days_of_week?.includes(targetDayOfWeek)) {
        continue; // Weekly habit, but not scheduled for this day of the week
      }
    }
    // If frequency is 'daily', it passes this check.

    // --- End Combined Filtering Logic ---

    // If all checks pass, the habit is active for this date
    activeHabitsForDate.push(habit);
  }

  // 3. Handle case where no habits are active for the date
  if (activeHabitsForDate.length === 0) {
    return 'no_habits';
  }

  // 4. Prepare completions lookup map for the target date for efficiency
  const completionsForDateMap = new Map<string, HabitCompletion['status']>();

  for (const completion of allCompletions) {
    // Directly iterate over the input array
    // Compare formatted strings for date equality check
    if (
      dayjs(completion.completion_date).format('YYYY-MM-DD') ===
      targetDateString
    ) {
      completionsForDateMap.set(completion.habit_id, completion.status);
    }
  }

  // 5. Calculate overall status based on filtered habits and completions map
  let completedCount = 0;
  let inProgressCount = 0;

  for (const habit of activeHabitsForDate) {
    const status = completionsForDateMap.get(habit.id); // O(1) lookup

    if (status === 'completed' || status === 'skipped') {
      completedCount++;
    } else if (status === 'in_progress') {
      inProgressCount++;
    }
    // 'not_started' or undefined status means neither completed nor in progress
  }
  // 6. Determine and return final status
  let finalStatus: CompletionStatus;
  if (completedCount === activeHabitsForDate.length) {
    finalStatus = 'all_completed';
  } else if (completedCount > 0 || inProgressCount > 0) {
    finalStatus = 'some_completed';
  } else {
    finalStatus = 'none_completed';
  }

  return finalStatus;
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
