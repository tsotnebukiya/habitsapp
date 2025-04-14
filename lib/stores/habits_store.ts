// interfaces/habits.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from '@/lib/utils/dayjs';
import { Database } from '@/lib/utils/supabase_types';
import useUserProfileStore from './user_profile';
import {
  BasePendingOperation,
  BaseState,
  createBaseState,
  getUserIdOrThrow,
  STORE_CONSTANTS,
} from './shared';
import { useAchievementsStore } from './achievements_store';
import { StreakDays } from '@/lib/constants/achievements';
import { StreakAchievements } from '@/lib/utils/achievement_scoring';
import { MMKV } from 'react-native-mmkv';

// Create MMKV instance
const habitsMmkv = new MMKV({ id: 'habits-store' });

// Types from Supabase schema
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
type HabitCompletionStatus =
  Database['public']['Enums']['habit_completion_status'];

interface PendingOperation extends BasePendingOperation {
  table: 'habits' | 'habit_completions';
  data?: Habit | HabitCompletion;
}

type HabitAction = 'toggle' | 'set_value' | 'toggle_skip' | 'toggle_complete';

export interface HabitsState extends BaseState {
  // Local state
  habits: Map<string, Habit>;
  completions: Map<string, HabitCompletion>;
  pendingOperations: PendingOperation[];

  // Habit actions
  getHabits: () => Map<string, Habit>;
  addHabit: (
    habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<string>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Completion actions
  getCompletions: () => Map<string, HabitCompletion>;
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

  // Habit status actions
  getHabitStatus: (habitId: string, date: Date) => HabitCompletion | null;
  getCurrentValue: (habitId: string, date: Date) => number;
  getCurrentProgress: (habitId: string, date: Date) => number;
  getProgressText: (habitId: string, date: Date) => string;

  // Sync actions
  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;

  // Queries
  getHabitsByDate: (date: dayjs.Dayjs) => Habit[];
  getCompletionsForHabit: (
    habitId: string,
    startDate: Date,
    endDate: Date
  ) => HabitCompletion[];
  getAllCompletions: () => HabitCompletion[];
  getHabitStreak: (habitId: string) => number;
  clearError: () => void;
}

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
      ...createBaseState(),
      habits: new Map(),
      completions: new Map(),
      pendingOperations: [],

      getHabits: () => get().habits,
      addHabit: async (habitData) => {
        const now = dayjs();
        const userId = getUserIdOrThrow();

        const newHabit: Habit = {
          ...habitData,
          id: uuidv4(),
          user_id: userId,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          is_active: true,
        };

        // Update local store first
        set((state) => {
          const newHabits = new Map(state.habits);
          newHabits.set(newHabit.id, newHabit);
          return { habits: newHabits };
        });

        // TODO: Add achievement update or not?

        try {
          const { error } = await supabase.from('habits').insert(newHabit);
          if (error) throw error;
        } catch (error) {
          const pendingOp = {
            id: newHabit.id,
            type: 'create' as const,
            table: 'habits' as const,
            data: newHabit,
            timestamp: now.toDate(),
            retryCount: 0,
            lastAttempt: now.toDate(),
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

        const now = dayjs();
        const updatedHabit = {
          ...habit,
          ...updates,
          updated_at: now.toISOString(),
        };

        // Update local first
        set((state) => {
          const newHabits = new Map(state.habits);
          newHabits.set(id, updatedHabit);
          return { habits: newHabits };
        });

        // TODO: Add achievement update or not?

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

          // TODO: Add achievement update or not?

          return newState;
        });

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
          const now = dayjs();
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

      getCompletions: () => get().completions,

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

        const normalizedDate = dayjs(date).format('YYYY-MM-DD');
        const existingCompletion = Array.from(get().completions.values()).find(
          (completion) =>
            completion.habit_id === habitId &&
            completion.completion_date === normalizedDate
        );

        let newStatus: HabitCompletionStatus = 'not_started';
        let newValue = 0;

        const maxValue = habit.goal_value || habit.completions_per_day || 1;
        const stepSize = habit.goal_value
          ? Math.max(habit.goal_value * 0.1, 1)
          : 1;
        const currentValue = existingCompletion?.value || 0;
        const currentStatus = existingCompletion?.status || 'not_started';

        switch (action) {
          case 'toggle':
            if (currentStatus === 'not_started') {
              // First toggle: start progress
              if (maxValue === 1) {
                // Single completion habit
                newValue = 1;
                newStatus = 'completed';
              } else {
                // Multiple completions or measured habit
                newValue = stepSize;
                newStatus = newValue >= maxValue ? 'completed' : 'in_progress';
              }
            } else if (currentStatus === 'in_progress') {
              // Already in progress: increment
              newValue = Math.min(currentValue + stepSize, maxValue);
              newStatus = newValue >= maxValue ? 'completed' : 'in_progress';
            } else {
              // Reset if completed
              newValue = 0;
              newStatus = 'not_started';
            }
            break;

          case 'set_value':
            if (value === undefined) return;
            newValue = Math.max(0, Math.min(value, maxValue));
            if (newValue === 0) {
              newStatus = 'not_started';
            } else if (newValue >= maxValue) {
              newStatus = 'completed';
            } else {
              newStatus = 'in_progress';
            }
            break;

          case 'toggle_skip':
            newStatus = currentStatus === 'skipped' ? 'not_started' : 'skipped';
            newValue = 0;
            break;

          case 'toggle_complete':
            if (currentStatus === 'completed') {
              newStatus = 'not_started';
              newValue = 0;
            } else {
              newStatus = 'completed';
              newValue = maxValue;
            }
            break;
        }

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

        // Calculate achievements
        useAchievementsStore
          .getState()
          .calculateAndUpdate(get().completions, get().habits);
      },

      getHabitStatus: (habitId: string, date: Date): HabitCompletion | null => {
        const normalizedDate = dayjs(date).format('YYYY-MM-DD');

        const completion = Array.from(get().completions.values()).find(
          (completion) =>
            completion.habit_id === habitId &&
            completion.completion_date === normalizedDate
        );

        return completion || null;
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

          if (serverHabits) {
            const localHabits = get().habits;
            serverHabits.forEach((serverHabit) => {
              const localHabit = localHabits.get(serverHabit.id);
              if (
                !localHabit ||
                dayjs(serverHabit.updated_at).isAfter(
                  dayjs(localHabit.updated_at)
                )
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
            lastSyncTime: dayjs().toDate(),
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
          const startDate = dayjs(habit.start_date).startOf('day');
          const endDate = habit.end_date
            ? dayjs(habit.end_date).startOf('day')
            : null;
          const targetDate = dayjs(date).startOf('day');

          return (
            startDate.isSameOrBefore(targetDate) &&
            (!endDate || endDate.isSameOrAfter(targetDate)) &&
            habit.is_active
          );
        });
      },

      getCompletionsForHabit: (habitId, startDate, endDate) => {
        return Array.from(get().completions.values()).filter((completion) => {
          const completionDate = dayjs(completion.completion_date);
          const start = dayjs(startDate);
          const end = dayjs(endDate);
          return (
            completion.habit_id === habitId &&
            completionDate.isSameOrAfter(start) &&
            completionDate.isSameOrBefore(end)
          );
        });
      },

      getAllCompletions: () => {
        return Array.from(get().completions.values());
      },

      getHabitStreak: (habitId) => {
        const habit = get().habits.get(habitId);
        if (!habit) return 0;

        const completions = Array.from(get().completions.values()).filter(
          (c) => c.habit_id === habitId
        );
        if (completions.length === 0) return 0;

        const today = dayjs().startOf('day');
        let currentStreak = 0;
        let currentDate = today;

        while (true) {
          const hasCompletionForDay = completions.some(
            (completion) =>
              dayjs(completion.completion_date)
                .startOf('day')
                .isSame(currentDate) && completion.status === 'completed'
          );

          if (!hasCompletionForDay) break;

          currentStreak++;
          currentDate = currentDate.subtract(1, 'day');
        }

        return currentStreak;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'habits-store',
      storage: {
        getItem: (name) => {
          const value = habitsMmkv.getString(name);
          if (!value) return null;

          const parsed = JSON.parse(value);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              habits: new Map(parsed.state.habits),
              completions: new Map(parsed.state.completions),
              lastSyncTime: dayjs(parsed.state.lastSyncTime).toDate(),
              pendingOperations: parsed.state.pendingOperations.map(
                (op: any) => ({
                  ...op,
                  timestamp: dayjs(op.timestamp).toDate(),
                  lastAttempt: op.lastAttempt
                    ? dayjs(op.lastAttempt).toDate()
                    : undefined,
                })
              ),
            },
          };
        },
        setItem: (name, value) => {
          const serialized = JSON.stringify({
            ...value,
            state: {
              ...value.state,
              habits: Array.from(value.state.habits.entries()),
              completions: Array.from(value.state.completions.entries()),
              lastSyncTime: value.state.lastSyncTime.toISOString(),
              pendingOperations: value.state.pendingOperations.map(
                (op: PendingOperation) => ({
                  ...op,
                  timestamp: dayjs(op.timestamp).toISOString(),
                  lastAttempt: op.lastAttempt?.toISOString(),
                })
              ),
            },
          });
          habitsMmkv.set(name, serialized);
        },
        removeItem: (name) => {
          habitsMmkv.delete(name);
        },
      },
    }
  )
);

export default useHabitsStore;
