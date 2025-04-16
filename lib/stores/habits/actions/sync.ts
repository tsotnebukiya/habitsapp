import { StateCreator } from 'zustand';
import {
  PendingOperation,
  SharedSlice,
  StreakAchievements,
  SyncSlice,
} from '../types';
import dayjs from '@/lib/utils/dayjs';
import { supabase } from '@/lib/utils/supabase';
import { getUserIdOrThrow, STORE_CONSTANTS } from '../utils';

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

      // Add achievements sync
      const { data: serverAchievements, error: achievementsError } =
        await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', getUserIdOrThrow())
          .single();

      if (achievementsError) throw achievementsError;

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
      if (serverAchievements) {
        // Update achievements state
        set({
          streakAchievements:
            (serverAchievements?.streak_achievements as StreakAchievements) ||
            {},
          currentStreak: serverAchievements.current_streak,
          maxStreak: serverAchievements.max_streak,
          cat1: serverAchievements.cat1 || 50,
          cat2: serverAchievements.cat2 || 50,
          cat3: serverAchievements.cat3 || 50,
          cat4: serverAchievements.cat4 || 50,
          cat5: serverAchievements.cat5 || 50,
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
