import useHabitsStore from '@/lib/habit-store/store';
import { Habit, HabitCompletion } from '@/lib/habit-store/types';
import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import { useMemo } from 'react';
import {
  getCurrentProgress,
  getHabitStatus,
  getMonthKey,
  getProgressText,
} from '../utils/habits';

export function useThreeMonthsStatuses(targetMonth?: Date) {
  const monthCache = useHabitsStore((state) => state.monthCache);
  const returnObj = useMemo(() => {
    const baseMonth = targetMonth ? dayjs(targetMonth) : dateUtils.today();
    const currentMonth = baseMonth.toDate();
    const prevMonth = baseMonth.subtract(1, 'month').toDate();
    const nextMonth = baseMonth.add(1, 'month').toDate();
    const currentMonthKey = getMonthKey(currentMonth);
    const prevMonthKey = getMonthKey(prevMonth);
    const nextMonthKey = getMonthKey(nextMonth);
    return {
      ...(monthCache.get(prevMonthKey) || {}),
      ...(monthCache.get(currentMonthKey) || {}),
      ...(monthCache.get(nextMonthKey) || {}),
    };
  }, [monthCache, targetMonth]);
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
        (!endDate || targetDate.isSameOrBefore(endDate, 'day')) &&
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

export const useWeeklyHabitProgress = () => {
  const habitsMap = useHabitsStore((state) => state.habits);
  const completionsMap = useHabitsStore((state) => state.completions);

  return useMemo(() => {
    const today = dateUtils.today();
    const startOfWeek = today.startOf('isoWeek'); // Monday
    const endOfWeek = today.endOf('isoWeek'); // Sunday

    const habits = Array.from(habitsMap.values());
    const completions = Array.from(completionsMap.values());

    // Create completion lookup map for faster access
    const completionsByHabitAndDate = new Map<
      string,
      Map<string, HabitCompletion>
    >();
    completions.forEach((completion) => {
      if (!completionsByHabitAndDate.has(completion.habit_id)) {
        completionsByHabitAndDate.set(completion.habit_id, new Map());
      }
      completionsByHabitAndDate
        .get(completion.habit_id)!
        .set(completion.completion_date, completion);
    });

    const weeklyProgress = habits
      .filter((habit) => {
        if (!habit.is_active) return false;

        const habitStartDate = dateUtils.normalizeLocal(
          habit.start_date || habit.created_at
        );
        const habitEndDate = habit.end_date
          ? dateUtils.normalizeLocal(habit.end_date)
          : null;

        // Check if habit overlaps with current week
        const habitStartsAfterWeek = habitStartDate.isAfter(endOfWeek, 'day');
        const habitEndsBeforeWeek =
          habitEndDate && habitEndDate.isBefore(startOfWeek, 'day');

        // Filter out habits that don't overlap with current week
        return !habitStartsAfterWeek && !habitEndsBeforeWeek;
      })
      .map((habit) => {
        const habitCompletions =
          completionsByHabitAndDate.get(habit.id) || new Map();
        const progressLevels = [];

        // Calculate progress for each day of the week (7 days)
        for (let i = 0; i < 7; i++) {
          const currentDate = startOfWeek.clone().add(i, 'day');
          const dayOfWeek = currentDate.day(); // 0 = Sunday, 1 = Monday, etc.
          const dateString = currentDate.format('YYYY-MM-DD');

          // Check if habit should be active on this day
          const habitStartDate = dateUtils.normalizeLocal(
            habit.start_date || habit.created_at
          );
          const habitEndDate = habit.end_date
            ? dateUtils.normalizeLocal(habit.end_date)
            : null;

          const isInHabitDateRange =
            currentDate.isSameOrAfter(habitStartDate, 'day') &&
            (!habitEndDate || currentDate.isSameOrBefore(habitEndDate, 'day'));

          let shouldBeActive = isInHabitDateRange;

          // Check weekly frequency
          if (
            shouldBeActive &&
            habit.frequency_type === 'weekly' &&
            habit.days_of_week
          ) {
            shouldBeActive = habit.days_of_week.includes(dayOfWeek);
          }

          let progress = 0;

          if (shouldBeActive) {
            const completion = habitCompletions.get(dateString);

            if (completion) {
              if (
                completion.status === 'completed' ||
                completion.status === 'skipped'
              ) {
                progress = 1;
              } else if (completion.status === 'in_progress') {
                const maxGoalValue =
                  habit.goal_value || habit.completions_per_day || 1;
                const currentValue = completion.value || 0;
                progress = Math.min(currentValue / maxGoalValue, 1);
              }
            }
          }

          progressLevels.push(progress);
        }

        return {
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          progressLevels, // Array of 7 numbers (0-1) representing progress for each day
        };
      });

    return weeklyProgress;
  }, [habitsMap, completionsMap]);
};
