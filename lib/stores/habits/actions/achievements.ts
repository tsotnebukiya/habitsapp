import { StateCreator } from 'zustand';
import {
  AchievementSlice,
  SharedSlice,
  StreakAchievements,
  UserAchievement,
} from '../types';
import dayjs from '@/lib/utils/dayjs';
import { supabase } from '@/lib/utils/supabase';
import { getUserIdOrThrow } from '../utils';
import { useUserProfileStore } from '../../user_profile';
import {
  calculateCurrentStreak,
  calculateDMS,
  calculateNewAchievements,
  getNewlyUnlockedAchievements,
} from '../utils-achieve';

export const createAchievementSlice: StateCreator<
  SharedSlice,
  [],
  [],
  AchievementSlice
> = (set, get) => ({
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

  calculateAndUpdate: () => {
    const { profile } = useUserProfileStore.getState();
    if (!profile) return { unlockedAchievements: [], currentStreak: 0 };

    // Calculate streaks
    const currentStreak = calculateCurrentStreak(
      get().completions,
      get().habits
    );
    const newAchievements = calculateNewAchievements(
      currentStreak,
      get().streakAchievements
    );

    // Calculate matrix scores
    const matrixScores = calculateDMS(
      profile,
      Array.from(get().habits.values()),
      Array.from(get().completions.values())
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
});
