import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAchievementSlice } from './actions/achievements';
import { createCalendarSlice } from './actions/calendar';
import { createCompletionSlice } from './actions/completions';
import { createHabitSlice } from './actions/habits';
import { createSyncSlice } from './actions/sync';
import { options } from './storage';
import { SharedSlice } from './types';

const useHabitsStore = create<SharedSlice>()(
  persist(
    (...a) => ({
      lastSyncTime: null,
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
