import { dateUtils } from '@/lib/utils/dayjs';
import {
  calculateHabitToggle,
  getUserIdOrThrow,
  handlePostActionOperations,
  normalizeDate,
} from '@/lib/utils/habits';
import { supabase } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { SharedSlice, type HabitAction, type HabitCompletion } from '../types';

export interface CompletionSlice {
  completions: Map<string, HabitCompletion>;

  addCompletion: (
    completion: Omit<HabitCompletion, 'id' | 'created_at'>
  ) => Promise<string>;
  updateCompletion: (
    id: string,
    updates: Partial<HabitCompletion>
  ) => Promise<void>;
  toggleHabitStatus: (
    habitId: string,
    date: Date,
    action: HabitAction,
    value?: number
  ) => void;
  resetHabitHistory: (habitId: string) => Promise<void>;
}

export const createCompletionSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CompletionSlice
> = (set, get) => ({
  completions: new Map(),
  addCompletion: async (completionData) => {
    const now = dateUtils.nowUTC();
    const newCompletion: HabitCompletion = {
      ...completionData,
      id: uuidv4(),
      created_at: dateUtils.toServerDateTime(now),
    };

    // Update local store first
    set((state) => {
      const newCompletions = new Map(state.completions);
      newCompletions.set(newCompletion.id, newCompletion);
      return { completions: newCompletions };
    });

    try {
      const { error } = await supabase
        .from('habit_completions')
        .insert(newCompletion);

      if (error) throw error;
    } catch (error) {
      const pendingOp = {
        id: newCompletion.id,
        type: 'create' as const,
        table: 'habit_completions' as const,
        data: newCompletion,
        timestamp: now.toDate(),
        retryCount: 0,
        lastAttempt: now.toDate(),
      };
      set((state) => ({
        pendingOperations: [...state.pendingOperations, pendingOp],
      }));
    }

    await get().processPendingOperations();

    return newCompletion.id;
  },

  updateCompletion: async (id, updates) => {
    const completion = get().completions.get(id);
    if (!completion) return;

    const updatedCompletion = {
      ...completion,
      ...updates,
    };

    // Update local first
    set((state) => {
      const newCompletions = new Map(state.completions);
      newCompletions.set(id, updatedCompletion);
      return { completions: newCompletions };
    });

    try {
      const { error } = await supabase
        .from('habit_completions')
        .update(updatedCompletion)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      const now = dateUtils.nowUTC();
      const pendingOp = {
        id,
        type: 'update' as const,
        table: 'habit_completions' as const,
        data: updatedCompletion,
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

  toggleHabitStatus: (
    habitId: string,
    date: Date,
    action: HabitAction,
    value?: number
  ) => {
    const userId = getUserIdOrThrow();
    const habit = get().habits.get(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }
    const { newValue, newStatus } = calculateHabitToggle({
      habit,
      date,
      action,
      value,
      completions: Array.from(get().completions.values()),
    });

    const normalizedDate = normalizeDate(date);
    const existingCompletion = Array.from(get().completions.values()).find(
      (completion) =>
        completion.habit_id === habitId &&
        completion.completion_date === normalizedDate
    );
    if (existingCompletion) {
      get().updateCompletion(existingCompletion.id, {
        status: newStatus,
        value: newValue,
      });
    } else {
      get().addCompletion({
        habit_id: habitId,
        user_id: userId,
        completion_date: normalizedDate,
        status: newStatus,
        value: newValue,
      });
    }
    handlePostActionOperations(get, habitId, [date]);
  },

  resetHabitHistory: async (habitId: string) => {
    // Get all completions for this habit
    const completionsToDelete = Array.from(get().completions.values())
      .filter((completion) => completion.habit_id === habitId)
      .map((completion) => completion.id);

    if (completionsToDelete.length === 0) return;

    // Update local store first
    set((state) => {
      const newCompletions = new Map(state.completions);
      completionsToDelete.forEach((id) => newCompletions.delete(id));
      return { completions: newCompletions };
    });

    // Update UI and sync
    handlePostActionOperations(get, habitId);

    try {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId);

      if (error) throw error;
    } catch (error) {
      const now = dateUtils.nowUTC();
      const userId = getUserIdOrThrow();

      // Create a dummy completion to satisfy the type system
      const dummyCompletion: HabitCompletion = {
        id: uuidv4(),
        habit_id: habitId,
        user_id: userId,
        completion_date: dateUtils.toLocalDateString(now),
        created_at: dateUtils.toServerDateTime(now),
        status: 'not_started',
        value: null,
      };

      const pendingOp = {
        id: habitId,
        type: 'delete' as const,
        table: 'habit_completions' as const,
        data: dummyCompletion,
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
});
