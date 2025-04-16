import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SharedSlice } from './types';
import { createHabitSlice } from './actions/habits';
import { createSyncSlice } from './actions/sync';
import { createCompletionSlice } from './actions/completions';
import { createCalendarSlice } from './actions/calendar';
import dayjs from '@/lib/utils/dayjs';
import { options } from './storage';
import { createAchievementSlice } from './actions/achievements';

const useHabitsStore = create<SharedSlice>()(
  persist(
    (...a) => ({
      lastSyncTime: dayjs(0).toDate(),
      isLoading: false,
      error: null,
      ...createHabitSlice(...a),
      ...createCompletionSlice(...a),
      ...createCalendarSlice(...a),
      ...createSyncSlice(...a),
      ...createAchievementSlice(...a),
    }),
    options
  )
);

export default useHabitsStore;
