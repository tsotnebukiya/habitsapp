import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { SharedSlice } from './types';
import { createHabitSlice } from './actions/habits';
import { createSyncSlice } from './actions/sync';
import { createCompletionSlice } from './actions/completions';
import { createCalendarSlice } from './actions/calendar';
import dayjs from '@/lib/utils/dayjs';
import { options } from './storage';
import { createAchievementSlice } from './actions/achievements';

const useHabitsStore = create<SharedSlice>()(
  subscribeWithSelector(
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
  )
);

useHabitsStore.subscribe(
  // Watch all trigger data in one selector
  (state) => ({
    completions: state.completions,
    habitIds: new Set(state.habits.keys()),
    completionsCount: state.completions.size,
  }),
  (newState, oldState) => {
    const state = useHabitsStore.getState();

    // Check if achievements need recalculation
    if (
      newState.completions !== oldState.completions ||
      newState.habitIds.size !== oldState.habitIds.size
    ) {
      state.calculateAndUpdate();
    }

    // Check if dates need recalculation
    if (
      newState.habitIds.size !== oldState.habitIds.size ||
      newState.completionsCount !== oldState.completionsCount
    ) {
      Array.from(state.habits.values()).forEach((habit) => {
        state.updateAffectedDates(habit.id);
      });
    }
  }
);

export default useHabitsStore;
