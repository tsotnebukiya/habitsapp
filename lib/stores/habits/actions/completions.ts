import { type HabitAction, type HabitCompletion } from '../types';
import { calculateHabitToggle, normalizeDate } from '@/lib/utils/habits';
import { StateCreator } from 'zustand';
import { SharedSlice } from '../types';
import dayjs from '@/lib/utils/dayjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabase/client';
import { getUserIdOrThrow } from '@/lib/utils/habits';

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
}

export const createCompletionSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CompletionSlice
> = (set, get) => ({
  completions: new Map(),
  addCompletion: async (completionData) => {
    const startTime = performance.now();
    const now = dayjs();
    const newCompletion: HabitCompletion = {
      ...completionData,
      id: uuidv4(),
      created_at: now.toISOString(),
    };

    // Update local store first
    set((state) => {
      const newCompletions = new Map(state.completions);
      newCompletions.set(newCompletion.id, newCompletion);
      return { completions: newCompletions };
    });

    const localUpdateTime = performance.now();
    console.log(
      `Local store update took: ${(localUpdateTime - startTime).toFixed(2)}ms`
    );

    try {
      const supabaseStartTime = performance.now();
      const { error } = await supabase
        .from('habit_completions')
        .insert(newCompletion);
      const supabaseEndTime = performance.now();
      console.log(
        `Supabase insert took: ${(supabaseEndTime - supabaseStartTime).toFixed(
          2
        )}ms`
      );

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

    const processingStartTime = performance.now();
    await get().processPendingOperations();
    const processingEndTime = performance.now();
    console.log(
      `Processing pending operations took: ${(
        processingEndTime - processingStartTime
      ).toFixed(2)}ms`
    );

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
      const now = dayjs();
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
    const startTime = performance.now();
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

    const secondTime = performance.now();
    console.log(
      `calculateHabitToggle took: ${(secondTime - startTime).toFixed(2)}ms`
    );
    const normalizedDate = normalizeDate(date);
    const existingCompletion = Array.from(get().completions.values()).find(
      (completion) =>
        completion.habit_id === habitId &&
        completion.completion_date === normalizedDate
    );
    const thirdTime = performance.now();
    console.log(
      `find existing completion took: ${(thirdTime - secondTime).toFixed(2)}ms`
    );
    // Update or create completion
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
    const fourthTime = performance.now();
    console.log(`addCompletion took: ${(fourthTime - thirdTime).toFixed(2)}ms`);
    get().updateDayStatus(date);
    const fifthTime = performance.now();
    console.log(
      `updateDayStatus took: ${(fifthTime - fourthTime).toFixed(2)}ms`
    );
  },
});
