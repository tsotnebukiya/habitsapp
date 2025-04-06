// interfaces/habits.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../app/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Database } from '../../app/supabase_types';
import useUserProfileStore from './user_profile';

// Types from Supabase schema
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
type HabitCompletionStatus =
  Database['public']['Enums']['habit_completion_status'];

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'habits' | 'habit_completions';
  data?: Habit | HabitCompletion;
  timestamp: Date;
  retryCount: number;
  lastAttempt?: Date;
}

export interface HabitsState {
  // Local state
  habits: Map<string, Habit>;
  completions: Map<string, HabitCompletion>;
  pendingOperations: PendingOperation[];
  lastSyncTime: Date;
  isLoading: boolean;
  error: string | null;

  // Habit actions
  addHabit: (
    habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<string>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Completion actions
  addCompletion: (
    completion: Omit<HabitCompletion, 'id' | 'created_at'>
  ) => Promise<string>;
  updateCompletion: (
    id: string,
    updates: Partial<HabitCompletion>
  ) => Promise<void>;
  deleteCompletion: (id: string) => Promise<void>;
  toggleHabitStatus: (
    habitId: string,
    date: Date,
    status: HabitCompletionStatus,
    value?: number
  ) => void;
  getHabitStatus: (habitId: string, date: Date) => HabitCompletionStatus;
  getCurrentValue: (habitId: string, date: Date) => number;
  getCurrentProgress: (habitId: string, date: Date) => number;
  getProgressText: (habitId: string, date: Date) => string;

  // Sync actions
  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;

  // Queries
  getHabitsByDate: (date: Date) => Habit[];
  getCompletionsForHabit: (
    habitId: string,
    startDate: Date,
    endDate: Date
  ) => HabitCompletion[];
  getHabitStreak: (habitId: string) => number;
  clearError: () => void;
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const MIN_RETRY_INTERVAL = 1000 * 60; // 1 minute

// USAGE NOTES:
// 1. Call syncWithServer() in these situations:
//    - When your app launches
//    - After user logs in
//    - When user manually requests sync
//    - Periodically (e.g., every hour) if needed
//
// 2. The store automatically attempts to sync pending operations:
//    - After adding/updating/deleting a habit
//    - After adding/updating/deleting a completion
//
// 3. Error Handling:
//    - Check store.error for sync/operation errors
//    - Call clearError() after handling errors in UI
//    - isLoading indicates sync in progress
//
// 4. Best Practices:
//    - Consider adding pull-to-refresh in UI to trigger manual sync
//    - Show last sync time in UI for transparency
//    - Handle loading states in UI during syncs
//    - Clean up subscriptions when component unmounts

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: new Map(),
      completions: new Map(),
      pendingOperations: [],
      lastSyncTime: new Date(0),
      isLoading: false,
      error: null,

      addHabit: async (habitData) => {
        const now = new Date().toISOString();
        const userId = useUserProfileStore.getState().profile?.id;
        if (!userId) {
          throw new Error('User not logged in');
        }

        const newHabit: Habit = {
          ...habitData,
          id: uuidv4(),
          user_id: userId,
          created_at: now,
          updated_at: now,
          is_active: true,
        };

        // Update local store first
        set((state) => {
          const newHabits = new Map(state.habits);
          newHabits.set(newHabit.id, newHabit);
          return { habits: newHabits };
        });

        try {
          const { error } = await supabase.from('habits').insert(newHabit);
          if (error) throw error;
        } catch (error) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: newHabit.id,
                type: 'create',
                table: 'habits',
                data: newHabit,
                timestamp: new Date(),
                retryCount: 0,
                lastAttempt: new Date(),
              },
            ],
          }));
        }

        await get().processPendingOperations();
        return newHabit.id;
      },

      updateHabit: async (id, updates) => {
        const habit = get().habits.get(id);
        if (!habit) return;

        const updatedHabit = {
          ...habit,
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // Update local first
        set((state) => {
          const newHabits = new Map(state.habits);
          newHabits.set(id, updatedHabit);
          return { habits: newHabits };
        });

        try {
          const { error } = await supabase
            .from('habits')
            .update(updatedHabit)
            .eq('id', id);

          if (error) throw error;
        } catch (error) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id,
                type: 'update',
                table: 'habits',
                data: updatedHabit,
                timestamp: new Date(),
                retryCount: 0,
                lastAttempt: new Date(),
              },
            ],
          }));
        }

        await get().processPendingOperations();
      },

      deleteHabit: async (id) => {
        // Delete locally first
        set((state) => {
          const newHabits = new Map(state.habits);
          newHabits.delete(id);
          return { habits: newHabits };
        });

        try {
          const { error } = await supabase.from('habits').delete().eq('id', id);
          if (error) throw error;
        } catch (error) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id,
                type: 'delete',
                table: 'habits',
                timestamp: new Date(),
                retryCount: 0,
                lastAttempt: new Date(),
              },
            ],
          }));
        }

        await get().processPendingOperations();
      },

      addCompletion: async (completionData) => {
        const now = new Date().toISOString();
        const newCompletion: HabitCompletion = {
          ...completionData,
          id: uuidv4(),
          created_at: now,
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
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: newCompletion.id,
                type: 'create',
                table: 'habit_completions',
                data: newCompletion,
                timestamp: new Date(),
                retryCount: 0,
                lastAttempt: new Date(),
              },
            ],
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
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id,
                type: 'update',
                table: 'habit_completions',
                data: updatedCompletion,
                timestamp: new Date(),
                retryCount: 0,
                lastAttempt: new Date(),
              },
            ],
          }));
        }

        await get().processPendingOperations();
      },

      deleteCompletion: async (id) => {
        // Delete locally first
        set((state) => {
          const newCompletions = new Map(state.completions);
          newCompletions.delete(id);
          return { completions: newCompletions };
        });

        try {
          const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('id', id);
          if (error) throw error;
        } catch (error) {
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id,
                type: 'delete',
                table: 'habit_completions',
                timestamp: new Date(),
                retryCount: 0,
                lastAttempt: new Date(),
              },
            ],
          }));
        }

        await get().processPendingOperations();
      },

      toggleHabitStatus: (
        habitId: string,
        date: Date,
        status: HabitCompletionStatus,
        value?: number
      ) => {
        const userId = useUserProfileStore.getState().profile?.id;
        if (!userId) {
          throw new Error('User not logged in');
        }

        const habit = get().habits.get(habitId);
        if (!habit) {
          throw new Error('Habit not found');
        }

        const normalizedDate = dayjs(date).format('YYYY-MM-DD');

        // Find existing completion for this habit on this date
        const existingCompletion = Array.from(get().completions.values()).find(
          (completion) =>
            completion.habit_id === habitId &&
            completion.completion_date === normalizedDate
        );

        // For skipped status, use the provided status directly
        if (status === 'skipped') {
          if (existingCompletion) {
            // Update existing completion
            get().updateCompletion(existingCompletion.id, {
              status: 'skipped',
              value: 0,
            });
          } else {
            // Create new completion
            get().addCompletion({
              habit_id: habitId,
              user_id: userId,
              completion_date: normalizedDate,
              status: 'skipped',
              value: 0,
            });
          }
          return;
        }

        // For not_started status, set value to 0
        if (status === 'not_started') {
          if (existingCompletion) {
            // Update existing completion
            get().updateCompletion(existingCompletion.id, {
              status: 'not_started',
              value: 0,
            });
          } else {
            // No need to create a completion for not_started if none exists
          }
          return;
        }

        // Calculate new value based on habit type
        let newValue: number;
        if (value !== undefined) {
          newValue = value;
        } else if (habit.goal_value) {
          // For measured habits, increment by 10% of goal
          const currentValue = existingCompletion?.value || 0;
          newValue = currentValue + habit.goal_value * 0.1;
        } else if (habit.completions_per_day > 1) {
          // For multiple completions, increment by 1
          const currentValue = existingCompletion?.value || 0;
          newValue = currentValue + 1;
        } else {
          // For single completion habits, value is 1
          newValue = 1;
        }

        // Determine status based on progress
        let newStatus = status;
        if (habit.goal_value) {
          newStatus =
            newValue >= habit.goal_value ? 'completed' : 'in_progress';
        } else if (habit.completions_per_day > 1) {
          newStatus =
            newValue >= habit.completions_per_day ? 'completed' : 'in_progress';
        } else {
          newStatus = 'completed';
        }

        if (existingCompletion) {
          // Update existing completion
          get().updateCompletion(existingCompletion.id, {
            status: newStatus,
            value: newValue,
          });
        } else {
          // Create new completion
          get().addCompletion({
            habit_id: habitId,
            user_id: userId,
            completion_date: normalizedDate,
            status: newStatus,
            value: newValue,
          });
        }
      },

      getHabitStatus: (habitId: string, date: Date): HabitCompletionStatus => {
        const normalizedDate = dayjs(date).format('YYYY-MM-DD');

        const completion = Array.from(get().completions.values()).find(
          (completion) =>
            completion.habit_id === habitId &&
            completion.completion_date === normalizedDate
        );

        return completion?.status || 'not_started';
      },

      getCurrentValue: (habitId: string, date: Date): number => {
        const normalizedDate = dayjs(date).format('YYYY-MM-DD');
        const completion = Array.from(get().completions.values()).find(
          (completion) =>
            completion.habit_id === habitId &&
            completion.completion_date === normalizedDate
        );
        return completion?.value || 0;
      },

      getCurrentProgress: (habitId: string, date: Date): number => {
        const habit = get().habits.get(habitId);
        if (!habit) return 0;

        const currentValue = get().getCurrentValue(habitId, date);

        if (habit.goal_value) {
          return Math.min(currentValue / habit.goal_value, 1);
        } else if (habit.completions_per_day > 1) {
          return Math.min(currentValue / habit.completions_per_day, 1);
        }

        return currentValue > 0 ? 1 : 0;
      },

      getProgressText: (habitId: string, date: Date): string => {
        const habit = get().habits.get(habitId);
        if (!habit) return '0/1';

        const currentValue = get().getCurrentValue(habitId, date);

        if (habit.goal_value && habit.goal_unit) {
          return `${currentValue}/${habit.goal_value}${habit.goal_unit}`;
        } else if (habit.completions_per_day > 1) {
          return `${currentValue}/${habit.completions_per_day}`;
        }

        return `${currentValue}/1`;
      },

      processPendingOperations: async () => {
        const { pendingOperations } = get();
        const now = new Date();
        const remainingOperations: PendingOperation[] = [];

        for (const operation of pendingOperations) {
          // Skip if we've tried too recently
          if (
            operation.lastAttempt &&
            now.getTime() - operation.lastAttempt.getTime() < MIN_RETRY_INTERVAL
          ) {
            remainingOperations.push(operation);
            continue;
          }

          try {
            if (operation.retryCount >= MAX_RETRY_ATTEMPTS) {
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
              lastAttempt: now,
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

          if (serverHabits) {
            const localHabits = get().habits;
            serverHabits.forEach((serverHabit) => {
              const localHabit = localHabits.get(serverHabit.id);
              if (
                !localHabit ||
                new Date(serverHabit.updated_at) >
                  new Date(localHabit.updated_at)
              ) {
                set((state) => {
                  const newHabits = new Map(state.habits);
                  newHabits.set(serverHabit.id, serverHabit);
                  return { habits: newHabits };
                });
              }
            });
          }

          if (serverCompletions) {
            const localCompletions = get().completions;
            serverCompletions.forEach((serverCompletion) => {
              if (!localCompletions.has(serverCompletion.id)) {
                set((state) => {
                  const newCompletions = new Map(state.completions);
                  newCompletions.set(serverCompletion.id, serverCompletion);
                  return { completions: newCompletions };
                });
              }
            });
          }

          set({
            lastSyncTime: new Date(),
            error: null,
          });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      getHabitsByDate: (date) => {
        return Array.from(get().habits.values()).filter((habit) => {
          const startDate = new Date(habit.start_date);
          const endDate = habit.end_date ? new Date(habit.end_date) : null;
          return (
            startDate <= date &&
            (!endDate || date <= endDate) &&
            habit.is_active
          );
        });
      },

      getCompletionsForHabit: (habitId, startDate, endDate) => {
        return Array.from(get().completions.values()).filter((completion) => {
          const completionDate = new Date(completion.completion_date);
          return (
            completion.habit_id === habitId &&
            completionDate >= startDate &&
            completionDate <= endDate
          );
        });
      },

      getHabitStreak: (habitId) => {
        const habit = get().habits.get(habitId);
        if (!habit) return 0;

        const completions = Array.from(get().completions.values()).filter(
          (c) => c.habit_id === habitId
        );
        if (completions.length === 0) return 0;

        const today = new Date().setHours(0, 0, 0, 0);
        let currentStreak = 0;
        let currentDate = today;

        while (true) {
          const hasCompletionForDay = completions.some(
            (completion) =>
              new Date(completion.completion_date).setHours(0, 0, 0, 0) ===
                currentDate && completion.status === 'completed'
          );

          if (!hasCompletionForDay) break;

          currentStreak++;
          currentDate -= 86400000; // Subtract one day in milliseconds
        }

        return currentStreak;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'habits-store',
      storage: {
        getItem: async (name) => {
          const str = await AsyncStorage.getItem(name);
          if (!str) return null;
          const value = JSON.parse(str);
          return {
            ...value,
            state: {
              ...value.state,
              habits: new Map(value.state.habits),
              completions: new Map(value.state.completions),
              lastSyncTime: new Date(value.state.lastSyncTime),
              pendingOperations: value.state.pendingOperations.map(
                (op: any) => ({
                  ...op,
                  timestamp: new Date(op.timestamp),
                  lastAttempt: op.lastAttempt
                    ? new Date(op.lastAttempt)
                    : undefined,
                })
              ),
            },
          };
        },
        setItem: async (name, value) => {
          const str = JSON.stringify({
            ...value,
            state: {
              ...value.state,
              habits: Array.from(value.state.habits.entries()),
              completions: Array.from(value.state.completions.entries()),
              lastSyncTime: value.state.lastSyncTime.toISOString(),
              pendingOperations: value.state.pendingOperations.map(
                (op: PendingOperation) => ({
                  ...op,
                  timestamp: op.timestamp.toISOString(),
                  lastAttempt: op.lastAttempt?.toISOString(),
                })
              ),
            },
          });
          await AsyncStorage.setItem(name, str);
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

export default useHabitsStore;
