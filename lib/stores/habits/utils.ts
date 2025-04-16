import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import { Database } from '@/lib/utils/supabase_types';
import { CompletionStatus, Habit, HabitAction, HabitCompletion } from './types';
import useUserProfileStore from '../user_profile';

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
export const calculateDateStatusUtility = (
  habits: Habit[],
  completions: HabitCompletion[],
  date: Date
): CompletionStatus => {
  const filteredHabits = habits.filter((habit) => {
    const startDate = dateUtils.normalize(habit.start_date);
    const endDate = habit.end_date ? dateUtils.normalize(habit.end_date) : null;
    const targetDate = dateUtils.normalize(date);

    return (
      dateUtils.isSameDay(startDate, targetDate) ||
      (dateUtils.isBeforeDay(startDate, targetDate) &&
        (!endDate ||
          dateUtils.isSameDay(endDate, targetDate) ||
          dateUtils.isAfterDay(endDate, targetDate)) &&
        habit.is_active)
    );
  });
  const habitsForDate = filteredHabits.filter((habit) => {
    const startDate = dayjs(habit.start_date).startOf('day');
    const endDate = habit.end_date
      ? dayjs(habit.end_date).endOf('day')
      : dayjs().add(1, 'month').endOf('day');
    const targetDate = dayjs(date).startOf('day');

    const isInDateRange =
      targetDate.isSameOrAfter(startDate) && targetDate.isSameOrBefore(endDate);

    if (habit.frequency_type === 'weekly' && habit.days_of_week) {
      return isInDateRange && habit.days_of_week.includes(targetDate.day());
    }

    return isInDateRange;
  });

  if (habitsForDate.length === 0) {
    return 'no_habits';
  }

  let completed = 0;
  let inProgress = 0;

  habitsForDate.forEach((habit) => {
    const completion = getHabitStatus(completions, habit.id, date);
    if (
      completion?.status === 'completed' ||
      completion?.status === 'skipped'
    ) {
      completed++;
    } else if (completion?.status === 'in_progress') {
      inProgress++;
    }
  });

  if (completed === habitsForDate.length) {
    return 'all_completed';
  } else if (completed > 0 || inProgress > 0) {
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
