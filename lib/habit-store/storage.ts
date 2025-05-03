import { dateUtils } from '@/lib/utils/dayjs';
import { MMKV } from 'react-native-mmkv';
import { PersistOptions } from 'zustand/middleware';
import { SharedSlice } from './types';
import { PersistStorage } from 'zustand/middleware';

const storeName = 'habits-store';

const habitsMmkv = new MMKV({ id: storeName });

const storage: PersistStorage<SharedSlice> = {
  getItem: (name: string) => {
    const value = habitsMmkv.getString(name);
    if (!value) return null;

    const parsed = JSON.parse(value);
    return {
      ...parsed,
      state: {
        ...parsed.state,
        habits: new Map(parsed.state.habits),
        completions: new Map(parsed.state.completions),
        monthCache: new Map(Object.entries(parsed.state.monthCache || {})),
        lastSyncTime: dateUtils
          .fromServerDate(parsed.state.lastSyncTime)
          .toDate(),
        streakAchievements: parsed.state.streakAchievements || {},
        currentStreak: parsed.state.currentStreak || 0,
        maxStreak: parsed.state.maxStreak || 0,
        cat1: parsed.state.cat1 || 50,
        cat2: parsed.state.cat2 || 50,
        cat3: parsed.state.cat3 || 50,
        cat4: parsed.state.cat4 || 50,
        cat5: parsed.state.cat5 || 50,
      },
    };
  },
  setItem: (name: string, value: { state: SharedSlice; version?: number }) => {
    const serialized = JSON.stringify({
      ...value,
      state: {
        ...value.state,
        habits: Array.from(value.state.habits.entries()),
        completions: Array.from(value.state.completions.entries()),
        monthCache: Object.fromEntries(value.state.monthCache),
        lastSyncTime: dateUtils.toServerDateTime(value.state.lastSyncTime),
        streakAchievements: value.state.streakAchievements,
        currentStreak: value.state.currentStreak,
        maxStreak: value.state.maxStreak,
        cat1: value.state.cat1,
        cat2: value.state.cat2,
        cat3: value.state.cat3,
        cat4: value.state.cat4,
        cat5: value.state.cat5,
      },
    });

    // Save to MMKV
    habitsMmkv.set(name, serialized);
  },
  removeItem: (name: string) => {
    habitsMmkv.delete(name);
  },
};

export const options: PersistOptions<SharedSlice, SharedSlice> = {
  name: storeName,
  storage: storage,
};
