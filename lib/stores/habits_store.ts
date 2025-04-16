// interfaces/habits.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from '@/lib/utils/dayjs';
import { Database } from '@/lib/utils/supabase_types';
import useUserProfileStore from './user_profile';
import { dateUtils } from '@/lib/utils/dayjs';
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
import { useDayStatusStore } from './day_status_store';

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
  monthStatusCache: Map<
    string,
    Map<
      string,
      {
        completionStatus:
          | 'no_habits'
          | 'all_completed'
          | 'some_completed'
          | 'none_completed';
      }
    >
  >;

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
  getMonthStatusMap: (month: dayjs.Dayjs) => Map<
    string,
    {
      completionStatus:
        | 'no_habits'
        | 'all_completed'
        | 'some_completed'
        | 'none_completed';
    }
  >;

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
      monthStatusCache: new Map(),

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

        // Update day status cache
        useDayStatusStore.getState().onHabitChange(newHabit.id);

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

        // Update day status cache
        useDayStatusStore.getState().onHabitChange(id);

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

        // Update day status cache before deleting
        useDayStatusStore.getState().onHabitChange(id);

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

        // Update day status cache
        useDayStatusStore.getState().onCompletionChange(date);

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
              useDayStatusStore
                .getState()
                .onCompletionChange(new Date(dateString));
            });
          }

          // Update cache for affected habits
          affectedHabits.forEach((habitId) => {
            useDayStatusStore.getState().onHabitChange(habitId);
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

      getHabitsByDate: (date) => {
        return Array.from(get().habits.values()).filter((habit) => {
          const startDate = dateUtils.normalize(habit.start_date);
          const endDate = habit.end_date
            ? dateUtils.normalize(habit.end_date)
            : null;
          const targetDate = dateUtils.normalize(date);

          return (
            dateUtils.isSameDay(startDate, targetDate) ||
            (dateUtils.isBeforeDay(startDate, targetDate) &&
              (!endDate ||
                dateUtils.isSameDay(endDate, targetDate) ||
                dateUtils.isAfterDay(endDate, targetDate)) &&
              habit.is_active)
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

      getMonthStatusMap: (month: dayjs.Dayjs) => {
        // Check cache first
        const cacheKey = month.format('YYYY-MM');
        const cached = get().monthStatusCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        // Get all data at once
        const allHabits = Array.from(get().habits.values());
        const allCompletions = Array.from(get().completions.values());

        // Pre-calculate date ranges
        const firstDayOfMonth = month.startOf('month');
        const lastDayOfMonth = month.endOf('month');
        let startDate = firstDayOfMonth.day(0);
        let endDate = lastDayOfMonth.day(6);

        if (dateUtils.isAfterDay(startDate, firstDayOfMonth)) {
          startDate = dateUtils.subtractDays(startDate, 7);
        }
        if (dateUtils.isBeforeDay(endDate, lastDayOfMonth)) {
          endDate = dateUtils.addDays(endDate, 7);
        }

        // Create arrays for dates and their strings
        const dates: { date: dayjs.Dayjs; dateString: string }[] = [];
        let currentDate = startDate;
        while (
          dateUtils.isBeforeDay(currentDate, endDate) ||
          dateUtils.isSameDay(currentDate, endDate)
        ) {
          dates.push({
            date: currentDate,
            dateString: dateUtils.toDateString(currentDate),
          });
          currentDate = dateUtils.addDays(currentDate, 1);
        }

        // Create bit arrays for active habits by date (much faster than Sets)
        const habitsByDate = new Map<string, Uint32Array>();
        const habitIds = new Map<string, number>(); // Map habit IDs to bit positions
        let nextBitPosition = 0;

        // First pass: assign bit positions to habits
        for (const habit of allHabits) {
          if (!habit.is_active) continue;
          habitIds.set(habit.id, nextBitPosition++);
        }

        // Create bit arrays for each date
        for (const { date, dateString } of dates) {
          const bitArray = new Uint32Array(Math.ceil(nextBitPosition / 32));
          habitsByDate.set(dateString, bitArray);
        }

        // Second pass: fill bit arrays
        for (const habit of allHabits) {
          if (!habit.is_active) continue;

          const bitPosition = habitIds.get(habit.id)!;
          const arrayIndex = Math.floor(bitPosition / 32);
          const bitMask = 1 << bitPosition % 32;

          const habitStartDate = dateUtils.normalize(habit.start_date);
          const habitEndDate = habit.end_date
            ? dateUtils.normalize(habit.end_date)
            : null;

          for (const { date, dateString } of dates) {
            const dayOfWeek = date.day();

            const isInDateRange =
              dateUtils.isSameDay(habitStartDate, date) ||
              (dateUtils.isBeforeDay(habitStartDate, date) &&
                (!habitEndDate ||
                  dateUtils.isSameDay(habitEndDate, date) ||
                  dateUtils.isAfterDay(habitEndDate, date)));

            if (!isInDateRange) continue;

            if (habit.frequency_type === 'weekly' && habit.days_of_week) {
              if (!habit.days_of_week.includes(dayOfWeek)) continue;
            }

            const bitArray = habitsByDate.get(dateString)!;
            bitArray[arrayIndex] |= bitMask;
          }
        }

        // Create completion status lookup using bit arrays
        const completionStatusMap = new Map<string, Map<string, string>>();
        for (const completion of allCompletions) {
          const dateCompletions =
            completionStatusMap.get(completion.completion_date) || new Map();
          dateCompletions.set(completion.habit_id, completion.status);
          completionStatusMap.set(completion.completion_date, dateCompletions);
        }

        // Calculate final statuses
        const statusMap = new Map<
          string,
          {
            completionStatus:
              | 'no_habits'
              | 'all_completed'
              | 'some_completed'
              | 'none_completed';
          }
        >();

        for (const { dateString } of dates) {
          const bitArray = habitsByDate.get(dateString)!;
          let hasHabits = false;

          // Quick check if there are any habits
          for (let i = 0; i < bitArray.length; i++) {
            if (bitArray[i] !== 0) {
              hasHabits = true;
              break;
            }
          }

          if (!hasHabits) {
            statusMap.set(dateString, { completionStatus: 'no_habits' });
            continue;
          }

          const dateCompletions =
            completionStatusMap.get(dateString) || new Map();
          let allCompleted = true;
          let someCompleted = false;

          // Check each habit's status using bit array
          for (const [habitId, bitPosition] of habitIds) {
            const arrayIndex = Math.floor(bitPosition / 32);
            const bitMask = 1 << bitPosition % 32;

            if ((bitArray[arrayIndex] & bitMask) === 0) continue;

            const status = dateCompletions.get(habitId);

            if (status === 'completed' || status === 'skipped') {
              someCompleted = true;
            } else {
              allCompleted = false;
              if (status === 'in_progress') {
                someCompleted = true;
              }
            }

            if (!allCompleted && someCompleted) break;
          }

          statusMap.set(dateString, {
            completionStatus: allCompleted
              ? 'all_completed'
              : someCompleted
              ? 'some_completed'
              : 'none_completed',
          });
        }

        // Cache the result
        set((state) => ({
          monthStatusCache: new Map(state.monthStatusCache).set(
            cacheKey,
            statusMap
          ),
        }));

        return statusMap;
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
              monthStatusCache: new Map(), // Don't persist cache
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
              monthStatusCache: [], // Don't persist cache
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
