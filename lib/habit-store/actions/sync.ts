import { dateUtils } from '@/lib/utils/dayjs';
import { getUserIdOrThrow, STORE_CONSTANTS } from '@/lib/utils/habits';
import { supabase } from '@/supabase/client';
import { StateCreator } from 'zustand';
import { PendingOperation, SharedSlice, StreakAchievements } from '../types';
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

      const userId = getUserIdOrThrow();

      // Simple approach: Always fetch all data and replace local state
      // This is more reliable and still fast for typical habit app data sizes
      const [habitsResult, completionsResult, achievementsResult] =
        await Promise.all([
          supabase.from('habits').select('*').eq('user_id', userId),

          supabase.from('habit_completions').select('*').eq('user_id', userId),

          supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId)
            .single(),
        ]);

      // Check for errors
      if (habitsResult.error) throw habitsResult.error;
      if (completionsResult.error) throw completionsResult.error;
      if (achievementsResult.error) throw achievementsResult.error;

      // Replace local state completely with server data
      const newHabits = new Map();
      habitsResult.data?.forEach((habit) => newHabits.set(habit.id, habit));

      const newCompletions = new Map();
      completionsResult.data?.forEach((completion) =>
        newCompletions.set(completion.id, completion)
      );

      // Update all state at once
      set({
        habits: newHabits,
        completions: newCompletions,
        // Update achievements if available
        ...(achievementsResult.data && {
          streakAchievements:
            (achievementsResult.data
              .streak_achievements as StreakAchievements) || {},
          currentStreak: achievementsResult.data.current_streak,
          maxStreak: achievementsResult.data.max_streak,
          cat1: achievementsResult.data.cat1 || 50,
          cat2: achievementsResult.data.cat2 || 50,
          cat3: achievementsResult.data.cat3 || 50,
          cat4: achievementsResult.data.cat4 || 50,
          cat5: achievementsResult.data.cat5 || 50,
        }),
      });

      // Update cache for all dates with completions
      const affectedDates = new Set<string>();
      completionsResult.data?.forEach((completion) => {
        affectedDates.add(completion.completion_date);
      });

      affectedDates.forEach((dateString) => {
        const date = dateUtils.fromServerDate(dateString).toDate();
        get().updateDayStatus(date);
      });

      // Trigger widget sync AFTER updating all data
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
