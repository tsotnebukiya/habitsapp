import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from '@/lib/utils/dayjs';
import { dateUtils } from '@/lib/utils/dayjs';
import { Database } from '@/lib/utils/supabase_types';
import { useHabitsStore } from './habits_store';

// Create MMKV instance
const dayStatusMmkv = new MMKV({ id: 'day-status-store' });

// Types
export type CompletionStatus =
  | 'no_habits'
  | 'all_completed'
  | 'some_completed'
  | 'none_completed';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

interface CachedDayStatus {
  date: string; // ISO date string
  status: CompletionStatus;
  lastUpdated: number; // timestamp for cache invalidation
}

interface MonthCache {
  [dateString: string]: CachedDayStatus;
}

interface DayStatusState {
  // Cache storage
  monthCache: Map<string, MonthCache>; // Key: YYYY-MM

  // Actions
  getMonthStatuses: (month: Date) => MonthCache;
  updateDayStatus: (date: Date, status: CompletionStatus) => void;
  invalidateMonth: (month: Date) => void;
  getDayStatus: (date: Date) => CachedDayStatus | null;

  // Cache management
  calculateDateStatus: (date: Date) => CompletionStatus;
  updateAffectedDates: (habitId: string) => void;
  onHabitChange: (habitId: string) => void;
  onCompletionChange: (date: Date) => void;
}

// Helper functions
const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
};

const getAffectedDates = (habit: Habit): Date[] => {
  const startDate = dayjs(habit.start_date).startOf('day');
  const endDate = habit.end_date
    ? dayjs(habit.end_date).endOf('day')
    : dayjs().add(1, 'month').endOf('day'); // Look ahead 1 month if no end date

  const dates: Date[] = [];
  let currentDate = startDate;

  while (currentDate.isSameOrBefore(endDate)) {
    // For weekly habits, only include days that match the frequency
    if (habit.frequency_type === 'weekly' && habit.days_of_week) {
      if (habit.days_of_week.includes(currentDate.day())) {
        dates.push(currentDate.toDate());
      }
    } else {
      // For daily habits, include all days
      dates.push(currentDate.toDate());
    }
    currentDate = currentDate.add(1, 'day');
  }

  return dates;
};

export const useDayStatusStore = create<DayStatusState>()(
  persist(
    (set, get) => ({
      // Initial state
      monthCache: new Map(),

      // Actions
      getMonthStatuses: (month: Date) => {
        const monthKey = getMonthKey(month);
        return get().monthCache.get(monthKey) || {};
      },

      updateDayStatus: (date: Date, status: CompletionStatus) => {
        const monthKey = getMonthKey(date);
        const currentCache = get().monthCache.get(monthKey) || {};
        const dateString = dayjs(date).format('YYYY-MM-DD');

        const updatedCache = {
          ...currentCache,
          [dateString]: {
            date: dateString,
            status,
            lastUpdated: Date.now(),
          },
        };

        set((state) => ({
          monthCache: new Map(state.monthCache).set(monthKey, updatedCache),
        }));
      },

      invalidateMonth: (month: Date) => {
        const monthKey = getMonthKey(month);
        set((state) => {
          const newCache = new Map(state.monthCache);
          newCache.delete(monthKey);
          return { monthCache: newCache };
        });
      },

      getDayStatus: (date: Date) => {
        const monthKey = getMonthKey(date);
        const cache = get().monthCache.get(monthKey) || {};
        const dateString = dayjs(date).format('YYYY-MM-DD');
        return cache[dateString] || null;
      },

      calculateDateStatus: (date: Date) => {
        const habitsStore = useHabitsStore.getState();
        const habitsForDate = habitsStore.getHabitsByDate(dayjs(date));

        if (habitsForDate.length === 0) {
          return 'no_habits';
        }

        let completed = 0;
        let inProgress = 0;

        habitsForDate.forEach((habit) => {
          const completion = habitsStore.getHabitStatus(habit.id, date);
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
      },

      updateAffectedDates: (habitId: string) => {
        const habitsStore = useHabitsStore.getState();
        const habit = habitsStore.getHabits().get(habitId);
        if (!habit) return;

        const dates = getAffectedDates(habit);
        const monthsToUpdate = new Set<string>();

        dates.forEach((date) => {
          const status = get().calculateDateStatus(date);
          get().updateDayStatus(date, status);
          monthsToUpdate.add(getMonthKey(date));
        });
      },

      onHabitChange: (habitId: string) => {
        get().updateAffectedDates(habitId);
      },

      onCompletionChange: (date: Date) => {
        const status = get().calculateDateStatus(date);
        get().updateDayStatus(date, status);
      },
    }),
    {
      name: 'day-status-store',
      storage: {
        getItem: (name) => {
          const value = dayStatusMmkv.getString(name);
          if (!value) return null;

          const parsed = JSON.parse(value);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              monthCache: new Map(
                Object.entries(parsed.state.monthCache || {})
              ),
            },
          };
        },
        setItem: (name, value) => {
          const serialized = JSON.stringify({
            ...value,
            state: {
              ...value.state,
              monthCache: Object.fromEntries(value.state.monthCache),
            },
          });
          dayStatusMmkv.set(name, serialized);
        },
        removeItem: (name) => {
          dayStatusMmkv.delete(name);
        },
      },
    }
  )
);

export default useDayStatusStore;
