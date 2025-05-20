import useHabitsStore from '@/lib/habit-store/store';
import { Habit } from '@/lib/habit-store/types';
import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import { useMemo } from 'react';
import {
  getCurrentProgress,
  getHabitStatus,
  getMonthKey,
  getProgressText,
} from '../utils/habits';

export function useThreeMonthsStatuses() {
  const monthCache = useHabitsStore((state) => state.monthCache);
  const returnObj = useMemo(() => {
    const currentMonth = dateUtils.todayUTC().toDate();
    const prevMonth = dateUtils.todayUTC().subtract(1, 'month').toDate();
    const nextMonth = dateUtils.todayUTC().add(1, 'month').toDate();
    const currentMonthKey = getMonthKey(currentMonth);
    const prevMonthKey = getMonthKey(prevMonth);
    const nextMonthKey = getMonthKey(nextMonth);
    return {
      ...(monthCache.get(prevMonthKey) || {}),
      ...(monthCache.get(currentMonthKey) || {}),
      ...(monthCache.get(nextMonthKey) || {}),
    };
  }, [monthCache]);
  return returnObj;
}

export const useHabit = (habitId: string) => {
  const habitsMap = useHabitsStore((state) => state.habits);
  return useMemo(() => {
    return habitsMap.get(habitId);
  }, [habitsMap, habitId]);
};

export const useAllHabits = () => {
  const habitsMap = useHabitsStore((state) => state.habits);

  return useMemo(() => {
    return Array.from(habitsMap.values());
  }, [habitsMap]);
};

export const useAllCompletions = () => {
  const completionsMap = useHabitsStore((state) => state.completions);
  return useMemo(() => {
    return Array.from(completionsMap.values());
  }, [completionsMap]);
};

export const useHabitsForDate = (date: Date) => {
  const habitsMap = useHabitsStore((state) => state.habits);

  return useMemo(() => {
    const targetDate = dayjs(date);
    const dayOfWeek = targetDate.day(); // 0 = Sunday, 1 = Monday, etc.

    return Array.from(habitsMap.values()).filter((habit: Habit) => {
      // First check start/end date ranges
      const startDate = dayjs(habit.start_date).startOf('day');
      const endDate = habit.end_date
        ? dayjs(habit.end_date).startOf('day')
        : null;

      const isInDateRange =
        startDate.isSameOrBefore(targetDate, 'day') &&
        (!endDate || endDate.isSameOrAfter(targetDate, 'day')) &&
        habit.is_active;

      if (!isInDateRange) return false;

      // Then check weekly frequency days if applicable
      if (habit.frequency_type === 'weekly' && habit.days_of_week) {
        // Check if the current day of week is included in the habit's days_of_week array
        return habit.days_of_week.includes(dayOfWeek);
      }

      // Daily habits or habits without days_of_week show on all days
      return true;
    });
  }, [habitsMap, date]); // Only recalculate if habitsMap or date changes
};

export const useHabitStatusInfo = (habitId: string, date: Date) => {
  const habitsMap = useHabitsStore((state) => state.habits);
  const completionsMap = useHabitsStore((state) => state.completions);
  return useMemo(() => {
    const habit = habitsMap.get(habitId);
    if (!habit) {
      return {
        completion: null,
        currentValue: 0,
        progress: 0,
        progressText: '',
      };
    }
    const completion = getHabitStatus(
      Array.from(completionsMap.values()),
      habitId,
      date
    );
    const currentValue = completion?.value || 0;
    const progress = getCurrentProgress(habit, currentValue);
    const progressText = getProgressText(habit, currentValue);

    return { completion, currentValue, progress, progressText };
  }, [habitsMap, completionsMap, habitId, date]);
};
