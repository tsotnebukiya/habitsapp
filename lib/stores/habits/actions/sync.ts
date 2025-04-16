import {
  normalizeDate,
  type HabitAction,
  type HabitCompletion,
} from '@/lib/utils/habits';
import { StateCreator } from 'zustand';
import {
  CalendarSlice,
  CompletionSlice,
  HabitSlice,
  PendingOperation,
  SharedSlice,
  SyncSlice,
} from '../types';
import dayjs from '@/lib/utils/dayjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/utils/supabase';
import { useAchievementsStore } from '../../achievements_store';
import { STORE_CONSTANTS } from '../../shared';

export const createSyncSlice: StateCreator<SharedSlice, [], [], SyncSlice> = (
  set,
  get
) => ({
  pendingOperations: [],
  processPendingOperations: async () => {
    const { pendingOperations } = get();
    const now = dayjs();
    const remainingOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      // Skip if we've tried too recently
      if (
        operation.lastAttempt &&
        now.diff(dayjs(operation.lastAttempt)) <
          STORE_CONSTANTS.MIN_RETRY_INTERVAL
      ) {
        remainingOperations.push(operation);
        continue;
      }

      try {
        if (operation.retryCount >= STORE_CONSTANTS.MAX_RETRY_ATTEMPTS) {
          console.error(
            `[Habits Store] Max retries exceeded for operation on ${operation.id}`
          );
          continue;
        }

        switch (operation.type) {
          case 'create':
          case 'update':
            if (operation.data) {
              const { error } = await supabase
                .from(operation.table)
                .upsert(operation.data);
              if (error) throw error;
            }
            break;

          case 'delete':
            const { error } = await supabase
              .from(operation.table)
              .delete()
              .eq('id', operation.id);
            if (error) throw error;
            break;
        }
      } catch (error) {
        remainingOperations.push({
          ...operation,
          retryCount: operation.retryCount + 1,
          lastAttempt: now.toDate(),
        });
      }
    }

    set({ pendingOperations: remainingOperations });
  },

  syncWithServer: async () => {
    set({ isLoading: true });

    try {
      // Process any pending operations first
      await get().processPendingOperations();

      const lastSync = get().lastSyncTime.toISOString();

      // Sync habits
      const { data: serverHabits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .gt('updated_at', lastSync);

      if (habitsError) throw habitsError;

      // Sync completions
      const { data: serverCompletions, error: completionsError } =
        await supabase
          .from('habit_completions')
          .select('*')
          .gt('created_at', lastSync);

      if (completionsError) throw completionsError;

      const affectedHabits = new Set<string>();

      if (serverHabits) {
        const localHabits = get().habits;
        serverHabits.forEach((serverHabit) => {
          const localHabit = localHabits.get(serverHabit.id);
          if (
            !localHabit ||
            dayjs(serverHabit.updated_at).isAfter(dayjs(localHabit.updated_at))
          ) {
            set((state) => {
              const newHabits = new Map(state.habits);
              newHabits.set(serverHabit.id, serverHabit);
              return { habits: newHabits };
            });
            affectedHabits.add(serverHabit.id);
          }
        });
      }

      if (serverCompletions) {
        const localCompletions = get().completions;
        const affectedDates = new Set<string>();

        serverCompletions.forEach((serverCompletion) => {
          if (!localCompletions.has(serverCompletion.id)) {
            set((state) => {
              const newCompletions = new Map(state.completions);
              newCompletions.set(serverCompletion.id, serverCompletion);
              return { completions: newCompletions };
            });
            affectedDates.add(serverCompletion.completion_date);
            affectedHabits.add(serverCompletion.habit_id);
          }
        });

        // Update cache for affected dates
        affectedDates.forEach((dateString) => {
          get().updateDayStatus(new Date(dateString), 'some_completed');
        });
      }

      // Update cache for affected habits
      affectedHabits.forEach((habitId) => {
        get().updateAffectedDates(habitId);
      });

      set({
        lastSyncTime: dayjs().toDate(),
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});
