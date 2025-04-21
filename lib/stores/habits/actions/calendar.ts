import { StateCreator } from 'zustand';
import { SharedSlice, CompletionStatus, MonthCache } from '../types';
import {
  calculateDateStatus,
  getAffectedDates,
  getMonthKey,
} from '@/lib/utils/habits';
import dayjs from '@/lib/utils/dayjs';

// Optimized cache type that only stores non-none_completed statuses
type OptimizedMonthCache = {
  [dateString: string]: CompletionStatus;
};

export interface CalendarSlice {
  monthCache: Map<string, OptimizedMonthCache>;

  getMonthStatuses: (month: Date) => MonthCache;
  updateDayStatus: (date: Date) => void;
  getDayStatus: (date: Date) => CompletionStatus;
  updateAffectedDates: (habitId: string, dates?: Date[]) => void;
  batchUpdateDayStatuses: (dates: Date[]) => void;
}

export const createCalendarSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CalendarSlice
> = (set, get) => ({
  monthCache: new Map(),

  getDayStatus: (date: Date) => {
    const monthKey = getMonthKey(date);
    const cache = get().monthCache.get(monthKey) || {};
    const dateString = dayjs(date).format('YYYY-MM-DD');
    return cache[dateString] || 'none_completed';
  },

  getMonthStatuses: (month: Date) => {
    const monthKey = getMonthKey(month);
    const optimizedCache = get().monthCache.get(monthKey) || {};

    const fullCache: MonthCache = {};
    const startOfMonth = dayjs(month).startOf('month');
    const daysInMonth = startOfMonth.daysInMonth();

    for (let i = 0; i < daysInMonth; i++) {
      const currentDate = startOfMonth.add(i, 'days');
      const dateString = currentDate.format('YYYY-MM-DD');

      fullCache[dateString] = optimizedCache[dateString] || 'none_completed';
    }

    return fullCache;
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
  batchUpdateDayStatuses: (dates: Date[]) => {
    const updates = new Map<string, OptimizedMonthCache>();
    console.log(dates);
    dates.forEach((date) => {
      const monthKey = getMonthKey(date);
      const dateString = dayjs(date).format('YYYY-MM-DD');

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
      console.log(status, date);
      const currentCache = get().monthCache.get(monthKey) || {};
      const currentStatus = currentCache[dateString];

      if (status !== currentStatus) {
        if (status === 'none_completed') {
          delete updates.get(monthKey)![dateString];
        } else {
          updates.get(monthKey)![dateString] = status;
        }
      } else {
        delete updates.get(monthKey)![dateString];
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
