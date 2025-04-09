import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';
import { Database } from '../utils/supabase_types';
import { StreakAchievements } from '../utils/achievement_scoring';
import dayjs from 'dayjs';
import {
  BaseState,
  BasePendingOperation,
  createAsyncStorage,
  createPendingOperation,
  shouldSkipOperation,
  getUserIdOrThrow,
  createErrorHandler,
  createBaseState,
} from './shared';

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
  persist((set, get) => {
    const errorHandler = createErrorHandler<AchievementsState>(set);

    return {
      ...createBaseState(),
      streakAchievements: {},
      pendingOperations: [],

      getStreakAchievements: () => {
        return get().streakAchievements;
      },

      updateAchievements: async (achievements: StreakAchievements) => {
        const userId = getUserIdOrThrow();

        const userAchievement: UserAchievement = {
          id: userId,
          user_id: userId,
          streak_achievements: achievements,
          created_at: dayjs().toISOString(),
          updated_at: dayjs().toISOString(),
        };

        // Update local first
        set({ streakAchievements: achievements });

        try {
          const { error } = await supabase
            .from('user_achievements')
            .upsert(userAchievement);
          if (error) throw error;
        } catch (error) {
          const pendingOp = createPendingOperation(
            userAchievement.id,
            'update',
            'user_achievements' as const,
            userAchievement
          ) as PendingOperation;

          set((state) => ({
            pendingOperations: [...state.pendingOperations, pendingOp],
          }));
        }

        await get().processPendingOperations();
      },

      resetAchievements: async () => {
        const userId = getUserIdOrThrow();
        set({ streakAchievements: {} });
        // Delete from server and  add pending if error
        try {
          const { error } = await supabase
            .from('user_achievements')
            .delete()
            .eq('user_id', userId);
          if (error) throw error;
        } catch (error) {
          const pendingOp = createPendingOperation(
            userId,
            'delete',
            'user_achievements' as const
          ) as PendingOperation;
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
            lastSyncTime: new Date(),
            isLoading: false,
          });
        } catch (error) {
          errorHandler.setError(error as Error);
        }
      },

      processPendingOperations: async () => {
        const state = get();
        if (state.pendingOperations.length === 0) return;

        const operations = [...state.pendingOperations];
        const remainingOperations: PendingOperation[] = [];

        for (const op of operations) {
          if (shouldSkipOperation(op)) {
            if (op.retryCount < 3) remainingOperations.push(op);
            continue;
          }

          try {
            if (op.type === 'update' && op.data) {
              const { error } = await supabase.from(op.table).upsert(op.data);
              if (error) throw error;
            }
          } catch (error) {
            remainingOperations.push({
              ...op,
              retryCount: op.retryCount + 1,
              lastAttempt: new Date(),
            });
          }
        }

        set({ pendingOperations: remainingOperations });
      },

      clearError: errorHandler.clearError,
    };
  }, createAsyncStorage('achievements-storage'))
);
