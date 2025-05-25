import { Database } from '@/supabase/types';
import { AchievementSlice } from './actions/achievements';
import { CalendarSlice } from './actions/calendar';
import { CompletionSlice } from './actions/completions';
import { HabitSlice } from './actions/habits';
import { SyncSlice } from './actions/sync';

export type HabitFrequency = 'daily' | 'weekly';

export type UserAchievement =
  Database['public']['Tables']['user_achievements']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];

export type HabitCompletion =
  Database['public']['Tables']['habit_completions']['Row'];

export type StreakDays =
  | 1
  | 3
  | 5
  | 7
  | 10
  | 14
  | 21
  | 28
  | 30
  | 45
  | 60
  | 90
  | 100
  | 180
  | 200;

export interface Achievement {
  id: StreakDays;
  name: string;
  days: number;
}

export type CompletionStatus =
  | 'all_completed'
  | 'some_completed'
  | 'none_completed';

export type HabitAction =
  | 'toggle'
  | 'set_value'
  | 'toggle_skip'
  | 'toggle_complete';

interface BasePendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: Date;
  retryCount: number;
  lastAttempt?: Date;
}

export interface DisplayedMatrixScore {
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;
  calculated_at: Date;
}

export interface PendingOperation extends BasePendingOperation {
  // Update table type to include achievements
  table: 'habits' | 'habit_completions' | 'user_achievements';
  // Update data type to include achievement data
  data?: Habit | HabitCompletion | UserAchievement;
}

interface BaseState {
  lastSyncTime: Date | null;
  isLoading: boolean;
  error: string | null;
}

export interface HabitsState extends BaseState {
  habits: Map<string, Habit>;
  completions: Map<string, HabitCompletion>;
  pendingOperations: PendingOperation[];
}

export type StreakAchievements = {
  [K in StreakDays]?: boolean;
};

export type SharedSlice = HabitSlice &
  CompletionSlice &
  CalendarSlice &
  SyncSlice &
  AchievementSlice &
  BaseState;

export interface HabitStatus {
  completion: HabitCompletion | null;
  currentValue: number;
  progress: number;
  progressText: string;
}
