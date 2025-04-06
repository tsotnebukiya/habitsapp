import { useMemo } from 'react';
import { useHabitsStore } from '../interfaces/habits_store';
import { Database } from '../../app/supabase_types';
import dayjs from 'dayjs';

type Habit = Database['public']['Tables']['habits']['Row'];

// Normalize date for consistent comparisons by setting time to 00:00:00
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Hook to get all habits
 * @returns {Habit[]} Array of all habits
 */
export const useAllHabits = () => {
  const habitsMap = useHabitsStore((state) => state.habits);

  // Only recompute when the habits Map changes
  return useMemo(() => {
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
    const comparisonDate = normalizeDate(date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return Array.from(habitsMap.values()).filter((habit: Habit) => {
      // First check start/end date ranges
      const startDate = normalizeDate(new Date(habit.start_date));
      const endDate = habit.end_date
        ? normalizeDate(new Date(habit.end_date))
        : null;

      const isInDateRange =
        startDate <= comparisonDate &&
        (!endDate || comparisonDate <= endDate) &&
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

/**
 * Hook to get a single habit by ID
 * @param id {string | null} The ID of the habit to get
 * @returns {Habit | null} The habit if found, null otherwise
 */
export const useHabit = (id: string | null) => {
  const habit = useHabitsStore((state) => (id ? state.habits.get(id) : null));
  return habit ?? null;
};
