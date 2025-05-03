import { StateCreator } from 'zustand';
import { PendingOperation, SharedSlice, StreakAchievements } from '../types';
import { dateUtils } from '@/lib/utils/dayjs';
import { supabase } from '@/supabase/client';
import { getUserIdOrThrow, STORE_CONSTANTS } from '@/lib/utils/habits';
import dayjs from 'dayjs';
import { syncStoreToWidget } from '../widget-storage';

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
    try {
      // Process any pending operations first
      await get().processPendingOperations();

      const lastSyncTimeValue = get().lastSyncTime; // Type: Date | null
      const isInitialSync = lastSyncTimeValue === null; // Direct check for null

      let habitsQuery = supabase
        .from('habits')
        .select('*')
        .eq('user_id', getUserIdOrThrow());

      let completionsQuery = supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', getUserIdOrThrow());

      if (!isInitialSync) {
        // We are sure lastSyncTimeValue is a Date here
        const lastSyncFormatted = dateUtils.toServerDateTime(lastSyncTimeValue); // Format the Date
        habitsQuery = habitsQuery.gt('updated_at', lastSyncFormatted);
        completionsQuery = completionsQuery.gt('created_at', lastSyncFormatted);
      }

      // Execute the constructed queries
      const { data: serverHabits, error: habitsError } = await habitsQuery;
      if (habitsError) throw habitsError;

      const { data: serverCompletions, error: completionsError } =
        await completionsQuery;
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
            // Compare timestamps directly, ensuring UTC context
            dayjs
              .utc(serverHabit.updated_at)
              .isAfter(dayjs.utc(localHabit.updated_at))
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
            // Ensure the date used for cache update is consistent (UTC string -> local Date)
            affectedDates.add(serverCompletion.completion_date);
            affectedHabits.add(serverCompletion.habit_id);
          }
        });

        // Update cache for affected dates
        affectedDates.forEach((dateString) => {
          // Convert UTC date string back to local Date object for updateDayStatus
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

      // Trigger widget sync AFTER merging server data
      const { habits, completions } = get();
      syncStoreToWidget(habits, completions);

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
