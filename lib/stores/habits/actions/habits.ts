import { StateCreator } from 'zustand';
import { supabase } from '@/lib/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from '@/lib/utils/dayjs';
import { getUserIdOrThrow } from '../utils';
import { HabitCompletion, type Habit } from '../types';
import { HabitSlice, SharedSlice } from '../types';
import { getCurrentProgress, getProgressText } from '../utils';
import { getHabitStatus } from '../utils';
import { getCurrentValue } from '../utils';

export const createHabitSlice: StateCreator<SharedSlice, [], [], HabitSlice> = (
  set,
  get
) => ({
  habits: new Map(),

  addHabit: async (habitData) => {
    const now = dayjs();
    const userId = getUserIdOrThrow();

    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      user_id: userId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      is_active: true,
    };

    // Update local store first
    set((state) => {
      const newHabits = new Map(state.habits);
      newHabits.set(newHabit.id, newHabit);
      return { habits: newHabits };
    });

    // Update affected dates
    get().updateAffectedDates(newHabit.id);

    try {
      const { error } = await supabase.from('habits').insert(newHabit);
      if (error) throw error;
    } catch (error) {
      const pendingOp = {
        id: newHabit.id,
        type: 'create' as const,
        table: 'habits' as const,
        data: newHabit,
        timestamp: now.toDate(),
        retryCount: 0,
        lastAttempt: now.toDate(),
      };
      set((state) => ({
        pendingOperations: [...state.pendingOperations, pendingOp],
      }));
    }

    await get().processPendingOperations();
    return newHabit.id;
  },

  updateHabit: async (id, updates) => {
    const habit = get().habits.get(id);
    if (!habit) return;

    const now = dayjs();
    const updatedHabit = {
      ...habit,
      ...updates,
      updated_at: now.toISOString(),
    };

    // Update local first
    set((state) => {
      const newHabits = new Map(state.habits);
      newHabits.set(id, updatedHabit);
      return { habits: newHabits };
    });

    // Update affected dates
    get().updateAffectedDates(id);

    try {
      const { error } = await supabase
        .from('habits')
        .update(updatedHabit)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      const pendingOp = {
        id,
        type: 'update' as const,
        table: 'habits' as const,
        data: updatedHabit,
        timestamp: now.toDate(),
        retryCount: 0,
        lastAttempt: now.toDate(),
      };
      set((state) => ({
        pendingOperations: [...state.pendingOperations, pendingOp],
      }));
    }

    await get().processPendingOperations();
  },

  deleteHabit: async (id) => {
    const habit = get().habits.get(id);
    if (!habit) return;

    // Update affected dates before deleting
    get().updateAffectedDates(id);

    // Update locally first
    set((state) => {
      const newState = { ...state };
      // Remove all completions for this habit
      const newCompletions = new Map(state.completions);
      Array.from(newCompletions.entries()).forEach(([key, completion]) => {
        if (completion.habit_id === id) {
          newCompletions.delete(key);
        }
      });

      // Remove the habit
      const newHabits = new Map(state.habits);
      newHabits.delete(id);

      newState.habits = newHabits;
      newState.completions = newCompletions;

      return newState;
    });

    try {
      // Delete completions from server first
      const { error: completionsError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', id);

      if (completionsError) throw completionsError;

      // Then delete the habit
      const { error: habitError } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (habitError) throw habitError;
    } catch (error) {
      const now = dayjs();
      const pendingOp = {
        id,
        type: 'delete' as const,
        table: 'habits' as const,
        timestamp: now.toDate(),
        retryCount: 0,
        lastAttempt: now.toDate(),
      };
      console.error('Error deleting habit:', error);
      set((state) => ({
        ...state,
        pendingOperations: [...state.pendingOperations, pendingOp],
      }));
    }

    await get().processPendingOperations();
  },
  getHabitStatus: (habitId: string, date: Date): HabitCompletion | null => {
    return getHabitStatus(
      Array.from(get().completions.values()),
      habitId,
      date
    );
  },
  getCurrentValue: (habitId: string, date: Date): number => {
    return getCurrentValue(
      Array.from(get().completions.values()),
      habitId,
      date
    );
  },

  getCurrentProgress: (habitId: string, date: Date): number => {
    const habit = get().habits.get(habitId);
    if (!habit) return 0;

    const currentValue = get().getCurrentValue(habitId, date);
    return getCurrentProgress(habit, currentValue);
  },

  getProgressText: (habitId: string, date: Date): string => {
    const habit = get().habits.get(habitId);
    if (!habit) return '0/1';

    const currentValue = get().getCurrentValue(habitId, date);
    return getProgressText(habit, currentValue);
  },
});
