import { useMemo } from 'react';
import useHabitsStore from '@/habits-store/store';
import { Database } from '@/supabase/types';
import dayjs from '@/lib/utils/dayjs';
import { Habit } from '@/habits-store/types';

export const useAllHabits = () => {
  const habitsMap = useHabitsStore((state) => state.habits);

  // Only recompute when the habits Map changes
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

export const useHabit = (id: string | null) => {
  const habit = useHabitsStore((state) => (id ? state.habits.get(id) : null));
  return habit ?? null;
};
