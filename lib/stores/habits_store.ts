import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from '@/lib/utils/dayjs';
import { Database } from '@/lib/utils/supabase_types';
import { dateUtils } from '@/lib/utils/dayjs';
import {
  BasePendingOperation,
  BaseState,
  createBaseState,
  getUserIdOrThrow,
  STORE_CONSTANTS,
} from './shared';
import { useAchievementsStore } from './achievements_store';
import { MMKV } from 'react-native-mmkv';
import {
  getMonthKey,
  getAffectedDates,
  normalizeDate,
  CompletionStatus,
  calculateDateStatusUtility,
  getHabitStatus,
  calculateHabitToggle,
  getCurrentValue,
  getCurrentProgress,
  getProgressText,
  Habit,
  HabitCompletion,
  HabitAction,
} from '@/lib/utils/habits';

const habitsMmkv = new MMKV({ id: 'habits-store' });

interface PendingOperation extends BasePendingOperation {
  table: 'habits' | 'habit_completions';
  data?: Habit | HabitCompletion;
}

export type { CompletionStatus }; // Re-export for backwards compatibility

interface CachedDayStatus {
  date: string;
  status: CompletionStatus;
  lastUpdated: number;
}

interface MonthCache {
  [dateString: string]: CachedDayStatus;
}

export interface HabitsState extends BaseState {
  // Local state
  habits: Map<string, Habit>;
  completions: Map<string, HabitCompletion>;
  pendingOperations: PendingOperation[];
  monthCache: Map<string, MonthCache>;

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
  toggleHabitStatus: (
    habitId: string,
    date: Date,
    action: HabitAction,
    value?: number
  ) => void;

  // Day status actions
  getMonthStatuses: (month: Date) => MonthCache;
  updateDayStatus: (date: Date, status: CompletionStatus) => void;
  getDayStatus: (date: Date) => CachedDayStatus | null;
  calculateDateStatus: (date: Date) => CompletionStatus;
  updateAffectedDates: (habitId: string) => void;

  // Habit status actions
  getHabitStatus: (habitId: string, date: Date) => HabitCompletion | null;
  getCurrentValue: (habitId: string, date: Date) => number;
  getCurrentProgress: (habitId: string, date: Date) => number;
  getProgressText: (habitId: string, date: Date) => string;

  // Sync actions
  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      ...createBaseState(),
      habits: new Map(),
      completions: new Map(),
      pendingOperations: [],
      monthCache: new Map(),

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

        // Update affected dates
        get().updateAffectedDates(newHabit.id);

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

        // Update affected dates
        get().updateAffectedDates(id);

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
        const habit = get().habits.get(id);
        if (!habit) return;

        // Update affected dates before deleting
        get().updateAffectedDates(id);

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

      getHabitStatus: (habitId: string, date: Date): HabitCompletion | null => {
        return getHabitStatus(
          Array.from(get().completions.values()),
          habitId,
          date
        );
      },

      getCurrentValue: (habitId: string, date: Date): number => {
        return getCurrentValue(
          Array.from(get().completions.values()),
          habitId,
          date
        );
      },

      getCurrentProgress: (habitId: string, date: Date): number => {
        const habit = get().habits.get(habitId);
        if (!habit) return 0;

        const currentValue = get().getCurrentValue(habitId, date);
        return getCurrentProgress(habit, currentValue);
      },

      getProgressText: (habitId: string, date: Date): string => {
        const habit = get().habits.get(habitId);
        if (!habit) return '0/1';

        const currentValue = get().getCurrentValue(habitId, date);
        return getProgressText(habit, currentValue);
      },

      getMonthStatuses: (month: Date) => {
        const monthKey = getMonthKey(month);
        return get().monthCache.get(monthKey) || {};
      },

      updateDayStatus: (date: Date, status: CompletionStatus) => {
        const monthKey = getMonthKey(date);
        const currentCache = get().monthCache.get(monthKey) || {};
        const dateString = dayjs(date).format('YYYY-MM-DD');

        const updatedCache = {
          ...currentCache,
          [dateString]: {
            date: dateString,
            status,
            lastUpdated: Date.now(),
          },
        };

        set((state) => ({
          monthCache: new Map(state.monthCache).set(monthKey, updatedCache),
        }));
      },

      getDayStatus: (date: Date) => {
        const monthKey = getMonthKey(date);
        const cache = get().monthCache.get(monthKey) || {};
        const dateString = dayjs(date).format('YYYY-MM-DD');
        return cache[dateString] || null;
      },

      calculateDateStatus: (date: Date): CompletionStatus => {
        return calculateDateStatusUtility(
          Array.from(get().habits.values()),
          Array.from(get().completions.values()),
          date
        );
      },

      updateAffectedDates: (habitId: string) => {
        const habit = get().habits.get(habitId);
        if (!habit) return;

        const dates = getAffectedDates(habit);
        dates.forEach((date) => {
          const status = get().calculateDateStatus(date);
          get().updateDayStatus(date, status);
        });
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

          const affectedHabits = new Set<string>();

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
              monthCache: new Map(
                Object.entries(parsed.state.monthCache || {})
              ),
              lastSyncTime: dayjs(parsed.state.lastSyncTime).toDate(),
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
              monthCache: Object.fromEntries(value.state.monthCache),
              lastSyncTime: value.state.lastSyncTime.toISOString(),
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
