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

type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];

interface PendingOperation extends BasePendingOperation {
  table: 'user_achievements';
  data?: UserAchievement;
}

interface AchievementsState extends BaseState {
  // Local state
  streakAchievements: StreakAchievements;
  pendingOperations: PendingOperation[];

  // Achievement actions
  updateAchievements: (achievements: StreakAchievements) => Promise<void>;
  getStreakAchievements: () => StreakAchievements;
  resetAchievements: () => Promise<void>;

  // Sync actions
  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;

  // Queries
  clearError: () => void;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => {
      return {
        ...createBaseState(),
        streakAchievements: {},
        pendingOperations: [],

        getStreakAchievements: () => {
          return get().streakAchievements;
        },

        updateAchievements: async (achievements: StreakAchievements) => {
          const userId = getUserIdOrThrow();
          const now = dayjs();

          const userAchievement: UserAchievement = {
            id: userId,
            user_id: userId,
            streak_achievements: achievements,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          };

          // Update local first
          set({ streakAchievements: achievements });

          try {
            const { error } = await supabase
              .from('user_achievements')
              .upsert(userAchievement);
            if (error) throw error;
          } catch (error) {
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

          await get().processPendingOperations();
        },

        resetAchievements: async () => {
          const userId = getUserIdOrThrow();
          const now = dayjs();
          set({ streakAchievements: {} });
          // Delete from server and  add pending if error
          try {
            const { error } = await supabase
              .from('user_achievements')
              .delete()
              .eq('user_id', userId);
            if (error) throw error;
          } catch (error) {
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
              streakAchievements:
                (userAchievement?.streak_achievements as StreakAchievements) ||
                {},
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
      };
    },
    {
      name: 'achievements-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
