import {
  calculateHabitToggle,
  normalizeDate,
  type HabitAction,
  type HabitCompletion,
} from '@/lib/utils/habits';
import { StateCreator } from 'zustand';
import {
  CalendarSlice,
  CompletionSlice,
  HabitSlice,
  SharedSlice,
} from '../types';
import dayjs from '@/lib/utils/dayjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/utils/supabase';
import { useAchievementsStore } from '../../achievements_store';
import { getUserIdOrThrow } from '../../shared';

export const createCompletionSlice: StateCreator<
  SharedSlice,
  [],
  [],
  CompletionSlice
> = (set, get) => ({
  completions: new Map(),
  addCompletion: async (completionData) => {
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

    // Update day status
    const status = get().calculateDateStatus(date);
    get().updateDayStatus(date, status);

    // Calculate achievements
    useAchievementsStore
      .getState()
      .calculateAndUpdate(get().completions, get().habits);
  },
});
