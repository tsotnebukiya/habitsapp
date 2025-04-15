import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';
import { Database } from '../utils/supabase_types';
import { StreakAchievements } from '../utils/achievement_scoring';
import dayjs from '@/lib/utils/dayjs';
import {
  BaseState,
  BasePendingOperation,
  getUserIdOrThrow,
  createBaseState,
  STORE_CONSTANTS,
} from './shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateCurrentStreak,
  calculateNewAchievements,
  getNewlyUnlockedAchievements,
} from '@/lib/utils/achievement_scoring';
import { StreakDays, Achievement } from '@/lib/constants/achievements';
import Toast from 'react-native-toast-message';
import { MMKV } from 'react-native-mmkv';
import { useModalStore } from './modal_store';
import { useUserProfileStore } from './user_profile';
import { calculateDMS } from '@/lib/utils/scoring';

// Create MMKV instance
const achievementsMmkv = new MMKV({ id: 'achievements-store' });

type Habit = Database['public']['Tables']['habits']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

interface PendingOperation extends BasePendingOperation {
  table: 'user_achievements';
  data?: UserAchievement;
}

interface AchievementsState extends BaseState {
  // Local state
  streakAchievements: StreakAchievements;
  currentStreak: number;
  maxStreak: number;
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;
  pendingOperations: PendingOperation[];

  // Achievement actions
  resetAchievements: () => void;
  setAchievements: (achievements: UserAchievement) => void;
  calculateAndUpdate: (
    completions: Map<string, HabitCompletion>,
    habits: Map<string, Habit>
  ) => {
    unlockedAchievements: StreakDays[];
    currentStreak: number;
  };

  // Sync actions
  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;

  // Queries
  clearError: () => void;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      ...createBaseState(),
      streakAchievements: {},
      currentStreak: 0,
      maxStreak: 0,
      cat1: 50,
      cat2: 50,
      cat3: 50,
      cat4: 50,
      cat5: 50,
      pendingOperations: [],

      setAchievements: (achievements) => {
        const now = dayjs();

        // Update local state immediately
        set({
          cat1: achievements.cat1 || 50,
          cat2: achievements.cat2 || 50,
          cat3: achievements.cat3 || 50,
          cat4: achievements.cat4 || 50,
          cat5: achievements.cat5 || 50,
          streakAchievements:
            achievements.streak_achievements as StreakAchievements,
          currentStreak: achievements.current_streak,
          maxStreak: achievements.max_streak,
        });

        // Fire and forget server update
        supabase
          .from('user_achievements')
          .upsert(achievements)
          .then(({ error }) => {
            if (error) {
              const pendingOp = {
                id: achievements.id,
                type: 'update' as const,
                table: 'user_achievements' as const,
                data: achievements,
                timestamp: now.toDate(),
                retryCount: 0,
                lastAttempt: now.toDate(),
              };
              set((state) => ({
                pendingOperations: [...state.pendingOperations, pendingOp],
              }));
            }
          });
      },

      calculateAndUpdate: (completions, habits) => {
        const { profile } = useUserProfileStore.getState();
        if (!profile) return { unlockedAchievements: [], currentStreak: 0 };

        // Calculate streaks
        const currentStreak = calculateCurrentStreak(completions, habits);
        const newAchievements = calculateNewAchievements(
          currentStreak,
          get().streakAchievements
        );

        // Calculate matrix scores
        const matrixScores = calculateDMS(
          profile,
          Array.from(habits.values()),
          Array.from(completions.values())
        );
        // Update both
        const userId = getUserIdOrThrow();
        const now = dayjs();

        const userAchievement: UserAchievement = {
          id: userId,
          user_id: userId,
          cat1: matrixScores.cat1 || profile.cat1,
          cat2: matrixScores.cat2 || profile.cat2,
          cat3: matrixScores.cat3 || profile.cat3,
          cat4: matrixScores.cat4 || profile.cat4,
          cat5: matrixScores.cat5 || profile.cat5,
          streak_achievements: newAchievements,
          current_streak: currentStreak,
          max_streak: Math.max(currentStreak, get().maxStreak),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };
        // Update local state
        set({
          cat1: userAchievement.cat1 || profile.cat1,
          cat2: userAchievement.cat2 || profile.cat2,
          cat3: userAchievement.cat3 || profile.cat3,
          cat4: userAchievement.cat4 || profile.cat4,
          cat5: userAchievement.cat5 || profile.cat5,
          streakAchievements: newAchievements,
          currentStreak,
          maxStreak: userAchievement.max_streak,
        });

        // Sync to server
        supabase
          .from('user_achievements')
          .upsert(userAchievement)
          .then(({ error }) => {
            if (error) {
              const pendingOp = {
                id: userAchievement.id,
                type: 'update' as const,
                table: 'user_achievements' as const,
                data: userAchievement,
                timestamp: now.toDate(),
                retryCount: 0,
                lastAttempt: now.toDate(),
              };
              set((state) => ({
                pendingOperations: [...state.pendingOperations, pendingOp],
              }));
            }
          });

        return {
          unlockedAchievements: getNewlyUnlockedAchievements(
            get().streakAchievements,
            newAchievements
          ),
          currentStreak,
        };
      },

      resetAchievements: () => {
        const userId = getUserIdOrThrow();
        const now = dayjs();

        // Update local state immediately
        set({
          streakAchievements: {},
          currentStreak: 0,
          maxStreak: 0,
          cat1: 50,
          cat2: 50,
          cat3: 50,
          cat4: 50,
          cat5: 50,
        });

        // Delete from server in the background
        supabase
          .from('user_achievements')
          .delete()
          .eq('user_id', userId)
          .then(({ error }) => {
            if (error) {
              const pendingOp = {
                id: userId,
                type: 'delete' as const,
                table: 'user_achievements' as const,
                timestamp: now.toDate(),
                retryCount: 0,
                lastAttempt: now.toDate(),
              };
              set((state) => ({
                pendingOperations: [...state.pendingOperations, pendingOp],
              }));
            }
          });
      },

      syncWithServer: async () => {
        const userId = getUserIdOrThrow();
        set({ isLoading: true, error: null });

        try {
          const { data: userAchievement, error } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (error) throw error;

          set({
            cat1: userAchievement?.cat1 ?? 50,
            cat2: userAchievement?.cat2 ?? 50,
            cat3: userAchievement?.cat3 ?? 50,
            cat4: userAchievement?.cat4 ?? 50,
            cat5: userAchievement?.cat5 ?? 50,
            streakAchievements:
              (userAchievement?.streak_achievements as StreakAchievements) ||
              {},
            currentStreak: userAchievement?.current_streak || 0,
            maxStreak: userAchievement?.max_streak || 0,
            lastSyncTime: dayjs().toDate(),
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message });
        }
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
                `[Achievements Store] Max retries exceeded for operation on ${operation.id}`
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

      clearError: () => set({ error: null }),
    }),
    {
      name: 'achievements-storage',
      storage: {
        getItem: (name) => {
          const value = achievementsMmkv.getString(name);
          if (!value) return null;
          return JSON.parse(value);
        },
        setItem: (name, value) => {
          achievementsMmkv.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          achievementsMmkv.delete(name);
        },
      },
    }
  )
);
