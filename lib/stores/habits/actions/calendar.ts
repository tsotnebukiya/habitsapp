import { StateCreator } from 'zustand';
import { CalendarSlice, CompletionStatus, SharedSlice } from '../types';
import { calculateDateStatusUtility } from '@/lib/utils/habits';
import { getAffectedDates } from '@/lib/utils/habits';
import { getMonthKey } from '@/lib/utils/habits';
import dayjs from '@/lib/utils/dayjs';

export const createCalendarSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CalendarSlice
> = (set, get) => ({
  monthCache: new Map(),
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

  getDayStatus: (date: Date) => {
    const monthKey = getMonthKey(date);
    const cache = get().monthCache.get(monthKey) || {};
    const dateString = dayjs(date).format('YYYY-MM-DD');
    return cache[dateString] || null;
  },

  calculateDateStatus: (date: Date): CompletionStatus => {
    return calculateDateStatusUtility(
      Array.from(get().habits.values()),
      Array.from(get().completions.values()),
      date
    );
  },

  updateAffectedDates: (habitId: string) => {
    const habit = get().habits.get(habitId);
    if (!habit) return;

    const dates = getAffectedDates(habit);
    dates.forEach((date) => {
      const status = get().calculateDateStatus(date);
      get().updateDayStatus(date, status);
    });
  },
  getMonthStatuses: (month: Date) => {
    const monthKey = getMonthKey(month);
    return get().monthCache.get(monthKey) || {};
  },
});
