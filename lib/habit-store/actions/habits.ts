import { dateUtils } from '@/lib/utils/dayjs';
import { getAffectedDates, getUserIdOrThrow } from '@/lib/utils/habits';
import { supabase } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { SharedSlice, type Habit } from '../types';
import { syncStoreToWidget } from '../widget-storage';

export interface HabitSlice {
  habits: Map<string, Habit>;

  addHabit: (
    habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<string>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabitOrder: (habitIds: string[]) => Promise<void>;
}

export const createHabitSlice: StateCreator<SharedSlice, [], [], HabitSlice> = (
  set,
  get
) => ({
  habits: new Map(),

  addHabit: async (habitData) => {
    const userId = getUserIdOrThrow();
    const date = new Date();
    // Get the highest sort_id
    let maxSortId = 0;
    Array.from(get().habits.values()).forEach((habit) => {
      if (habit.sort_id && habit.sort_id > maxSortId) {
        maxSortId = habit.sort_id;
      }
    });

    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      user_id: userId,
      created_at: dateUtils.toServerDateTime(date),
      updated_at: dateUtils.toServerDateTime(date),
      is_active: true,
      sort_id: maxSortId + 1,
    };

    // Update local store first
    set((state) => {
      const newHabits = new Map(state.habits);
      newHabits.set(newHabit.id, newHabit);
      return { habits: newHabits };
    });

    // Actions
    get().updateAffectedDates(newHabit.id);
    syncStoreToWidget(get().habits, get().completions);
    setTimeout(() => {
      get().calculateAndUpdate();
    }, 100);

    try {
      const { error } = await supabase.from('habits').insert(newHabit);
      if (error) throw error;
    } catch (error) {
      const pendingOp = {
        id: newHabit.id,
        type: 'create' as const,
        table: 'habits' as const,
        data: newHabit,
        timestamp: new Date(),
        retryCount: 0,
        lastAttempt: new Date(),
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

    const now = dateUtils.nowUTC();
    const updatedHabit = {
      ...habit,
      ...updates,
      updated_at: dateUtils.toServerDateTime(now),
    };

    // Update local first
    set((state) => {
      const newHabits = new Map(state.habits);
      newHabits.set(id, updatedHabit);
      return { habits: newHabits };
    });

    // Actions
    get().updateAffectedDates(habit.id);
    syncStoreToWidget(get().habits, get().completions);
    setTimeout(() => {
      get().calculateAndUpdate();
    }, 100);

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
    const dates = getAffectedDates(habit);
    // Actions
    get().updateAffectedDates(habit.id, dates);
    syncStoreToWidget(get().habits, get().completions);
    setTimeout(() => {
      get().calculateAndUpdate();
    }, 100);

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
      const now = dateUtils.nowUTC();
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

  updateHabitOrder: async (habitIds: string[]) => {
    // Update local store first
    set((state) => {
      const newHabits = new Map(state.habits);
      habitIds.forEach((id, index) => {
        const habit = newHabits.get(id);
        if (habit) {
          newHabits.set(id, {
            ...habit,
            sort_id: index + 1,
            updated_at: dateUtils.toServerDateTime(new Date()),
          });
        }
      });
      return { habits: newHabits };
    });

    try {
      // Update each habit's sort_id one by one
      for (let i = 0; i < habitIds.length; i++) {
        const { error } = await supabase
          .from('habits')
          .update({
            sort_id: i + 1,
            updated_at: dateUtils.toServerDateTime(new Date()),
          })
          .eq('id', habitIds[i]);

        if (error) throw error;
      }
    } catch (error) {
      // Get the first habit's full data for pending operations
      const habit = get().habits.get(habitIds[0]);
      if (habit) {
        const pendingOp = {
          id: uuidv4(),
          type: 'update' as const,
          table: 'habits' as const,
          data: {
            ...habit,
            sort_id: 1,
            updated_at: dateUtils.toServerDateTime(new Date()),
          },
          timestamp: new Date(),
          retryCount: 0,
          lastAttempt: new Date(),
        };

        set((state) => ({
          pendingOperations: [...state.pendingOperations, pendingOp],
        }));
      }
    }

    await get().processPendingOperations();
  },
});
