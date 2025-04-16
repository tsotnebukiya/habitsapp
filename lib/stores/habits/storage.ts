import dayjs from '@/lib/utils/dayjs';
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
        lastSyncTime: dayjs(parsed.state.lastSyncTime).toDate(),
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
        lastSyncTime: value.state.lastSyncTime.toISOString(),
      },
    });
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
