import { useMemo } from 'react';
import { useHabitsStore } from '../interfaces/habits_store';
import { Database } from '../../app/supabase_types';
import dayjs from 'dayjs';

type Habit = Database['public']['Tables']['habits']['Row'];

/**
 * Hook to get all habits
 * @returns {Habit[]} Array of all habits
 */
export const useAllHabits = () => {
  const habitsMap = useHabitsStore((state) => state.habits);

  // Only recompute when the habits Map changes
  return useMemo(() => {
    console.log('Recalculating all habits');
    return Array.from(habitsMap.values());
  }, [habitsMap]);
};

/**
 * Hook to get habits for a specific date
 * @param date {Date} The date to get habits for
 * @returns {Habit[]} Array of habits for the specified date
 */
export const useHabitsForDate = (date: Date) => {
  const habitsMap = useHabitsStore((state) => state.habits);

  return useMemo(() => {
    console.log('Recalculating habits for date (hook):', date);
    const comparisonDate = new Date(date);
    comparisonDate.setHours(0, 0, 0, 0); // Normalize date for comparison

    return Array.from(habitsMap.values()).filter((habit: Habit) => {
      const startDate = new Date(habit.start_date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = habit.end_date ? new Date(habit.end_date) : null;
      if (endDate) {
        endDate.setHours(0, 0, 0, 0);
      }

      return (
        startDate <= comparisonDate &&
        (!endDate || comparisonDate <= endDate) &&
        habit.is_active
      );
    });
  }, [habitsMap, date]); // Only recalculate if habitsMap or date changes
};

/**
 * Hook to get a single habit by ID
 * @param id {string | null} The ID of the habit to get
 * @returns {Habit | null} The habit if found, null otherwise
 */
export const useHabit = (id: string | null) => {
  const habit = useHabitsStore((state) => (id ? state.habits.get(id) : null));
  return habit ?? null;
};
