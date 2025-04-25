import { StateCreator } from 'zustand';
import { PendingOperation, SharedSlice, StreakAchievements } from '../types';
import { dateUtils } from '@/lib/utils/dayjs';
import { supabase } from '@/supabase/client';
import { getUserIdOrThrow, STORE_CONSTANTS } from '@/lib/utils/habits';

export interface SyncSlice {
  pendingOperations: PendingOperation[];

  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;
}

export const createSyncSlice: StateCreator<SharedSlice, [], [], SyncSlice> = (
  set,
  get
) => ({
  pendingOperations: [],
  processPendingOperations: async () => {
    const { pendingOperations } = get();
    const now = dateUtils.nowUTC();
    const remainingOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      // Skip if we've tried too recently
      if (
        operation.lastAttempt &&
        now.diff(
          dateUtils.fromServerDate(
            dateUtils.toServerDateTime(operation.lastAttempt)
          )
        ) < STORE_CONSTANTS.MIN_RETRY_INTERVAL
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
    console.log('syncWithServer');
    try {
      // Process any pending operations first
      await get().processPendingOperations();

      const lastSync = dateUtils.toServerDateTime(get().lastSyncTime);

      // Sync habits
      const { data: serverHabits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .gt('updated_at', lastSync);
      console.log(serverHabits);
      if (habitsError) throw habitsError;

      // Sync completions
      const { data: serverCompletions, error: completionsError } =
        await supabase
          .from('habit_completions')
          .select('*')
          .gt('created_at', lastSync);
      console.log(serverCompletions);
      if (completionsError) throw completionsError;

      // Add achievements sync
      const { data: serverAchievements, error: achievementsError } =
        await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', getUserIdOrThrow())
          .single();
      console.log(serverAchievements);
      if (achievementsError) throw achievementsError;

      const affectedHabits = new Set<string>();

      if (serverHabits) {
        const newHabits = new Map();
        serverHabits.forEach((serverHabit) => {
          newHabits.set(serverHabit.id, serverHabit);
          affectedHabits.add(serverHabit.id);
        });
        set({ habits: newHabits });
      }

      if (serverCompletions) {
        const newCompletions = new Map();
        const affectedDates = new Set<string>();

        serverCompletions.forEach((serverCompletion) => {
          newCompletions.set(serverCompletion.id, serverCompletion);
          affectedDates.add(serverCompletion.completion_date);
          affectedHabits.add(serverCompletion.habit_id);
        });

        set({ completions: newCompletions });

        // Update cache for affected dates
        affectedDates.forEach((dateString) => {
          const date = dateUtils.fromServerDate(dateString).toDate();
          get().updateDayStatus(date);
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

      set({
        lastSyncTime: dateUtils.nowUTC().toDate(),
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});
