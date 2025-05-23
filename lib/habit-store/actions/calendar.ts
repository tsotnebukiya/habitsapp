import { dateUtils } from '@/lib/utils/dayjs';
import {
  calculateDateStatus,
  getAffectedDates,
  getMonthKey,
} from '@/lib/utils/habits';
import { StateCreator } from 'zustand';
import { SharedSlice } from '../types';

// Optimized cache type that only stores non-none_completed statuses
type OptimizedMonthCache = {
  [dateString: string]: number;
};

export interface CalendarSlice {
  monthCache: Map<string, OptimizedMonthCache>;

  getMonthStatuses: (month: Date) => OptimizedMonthCache;
  getCurrentThreeMonthsStatuses: () => OptimizedMonthCache;
  updateDayStatus: (date: Date) => void;
  getDayStatus: (date: Date) => number;
  updateAffectedDates: (habitId: string, dates?: Date[]) => void;
  batchUpdateDayStatuses: (dates: Date[]) => void;
  recalcAllStatuses: () => void;
}

export const createCalendarSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CalendarSlice
> = (set, get) => ({
  monthCache: new Map(),
  getCurrentThreeMonthsStatuses: () => {
    const currentMonth = dateUtils.today().toDate();
    const prevMonth = dateUtils.today().subtract(1, 'month').toDate();
    const nextMonth = dateUtils.today().add(1, 'month').toDate();
    return {
      ...get().getMonthStatuses(currentMonth),
      ...get().getMonthStatuses(prevMonth),
      ...get().getMonthStatuses(nextMonth),
    };
  },

  getDayStatus: (date: Date) => {
    const monthKey = getMonthKey(date);
    const cache = get().monthCache.get(monthKey) || {};
    const dateString = dateUtils.toLocalDateString(date);
    return cache[dateString] || 0;
  },

  getMonthStatuses: (month: Date) => {
    const monthKey = getMonthKey(month);
    const optimizedCache = get().monthCache.get(monthKey) || {};
    return optimizedCache;
  },

  updateDayStatus: (date: Date) => {
    get().batchUpdateDayStatuses([date]);
  },

  updateAffectedDates: (habitId: string, dates?: Date[]) => {
    let datesToUpdate = dates;
    if (dates) {
      datesToUpdate = dates;
    } else {
      const habit = get().habits.get(habitId);
      if (!habit) return;
      datesToUpdate = getAffectedDates(habit);
    }
    get().batchUpdateDayStatuses(datesToUpdate);
  },

  recalcAllStatuses: () => {
    const dates = Array.from(get().habits.values()).flatMap((habit) =>
      getAffectedDates(habit)
    );
    get().batchUpdateDayStatuses(dates);
  },

  batchUpdateDayStatuses: (dates: Date[]) => {
    const updates = new Map<string, OptimizedMonthCache>();
    dates.forEach((date) => {
      const monthKey = getMonthKey(date);
      const dateString = dateUtils.toLocalDateString(date);

      if (!updates.has(monthKey)) {
        updates.set(monthKey, {
          ...(get().monthCache.get(monthKey) || {}),
        });
      }

      const status = calculateDateStatus(
        Array.from(get().habits.values()),
        Array.from(get().completions.values()),
        date
      );

      if (status === 0) {
        // If the new status is 'none_completed', delete it from the updates map.
        // We check hasOwnProperty to ensure we only delete if it was actually present.
        if (updates.get(monthKey)?.hasOwnProperty(dateString)) {
          delete updates.get(monthKey)![dateString];
        }
      } else {
        // If the new status is not 'none_completed', add or update it in the updates map.
        updates.get(monthKey)![dateString] = status;
      }
    });
    set((state) => {
      const newMonthCache = new Map(state.monthCache);
      updates.forEach((monthUpdates, monthKey) => {
        if (Object.keys(monthUpdates).length === 0) {
          newMonthCache.delete(monthKey);
        } else {
          newMonthCache.set(monthKey, monthUpdates);
        }
      });
      return { monthCache: newMonthCache };
    });
  },
});
