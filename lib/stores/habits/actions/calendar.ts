import { StateCreator } from 'zustand';
import { CachedDayStatus, MonthCache, SharedSlice } from '../types';
import {
  calculateDateStatus,
  getAffectedDates,
  getMonthKey,
} from '@/lib/utils/habits';
import dayjs from '@/lib/utils/dayjs';

export interface CalendarSlice {
  monthCache: Map<string, MonthCache>;

  getMonthStatuses: (month: Date) => MonthCache;
  updateDayStatus: (date: Date) => void;
  getDayStatus: (date: Date) => CachedDayStatus | null;
  updateAffectedDates: (habitId: string) => void;
}

export const createCalendarSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CalendarSlice
> = (set, get) => ({
  monthCache: new Map(),
  updateDayStatus: (date: Date) => {
    const monthKey = getMonthKey(date);
    const currentCache = get().monthCache.get(monthKey) || {};
    const dateString = dayjs(date).format('YYYY-MM-DD');
    const status = calculateDateStatus(
      Array.from(get().habits.values()),
      Array.from(get().completions.values()),
      date
    );

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

  getDayStatus: (date: Date) => {
    const monthKey = getMonthKey(date);
    const cache = get().monthCache.get(monthKey) || {};
    const dateString = dayjs(date).format('YYYY-MM-DD');
    return cache[dateString] || null;
  },

  updateAffectedDates: (habitId: string) => {
    const startTime = performance.now();
    const habit = get().habits.get(habitId);
    if (!habit) return;

    const datesStartTime = performance.now();
    const dates = getAffectedDates(habit);
    const datesEndTime = performance.now();
    console.log(
      `Getting affected dates took: ${(datesEndTime - datesStartTime).toFixed(
        2
      )}ms`
    );

    const updateStartTime = performance.now();

    const updateEndTime = performance.now();
    console.log(
      `Updating all affected dates took: ${(
        updateEndTime - updateStartTime
      ).toFixed(2)}ms`
    );

    const totalTime = performance.now() - startTime;
    console.log(`Total update affected dates took: ${totalTime.toFixed(2)}ms`);
  },

  getMonthStatuses: (month: Date) => {
    const monthKey = getMonthKey(month);
    return get().monthCache.get(monthKey) || {};
  },
});
