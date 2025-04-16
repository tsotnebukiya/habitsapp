import { Database } from '@/lib/utils/supabase_types';

export type HabitFrequency = 'daily' | 'weekly';

export type UserAchievement =
  Database['public']['Tables']['user_achievements']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];

export type HabitCompletion =
  Database['public']['Tables']['habit_completions']['Row'];

export type StreakDays =
  | 1
  | 3
  | 7
  | 10
  | 14
  | 21
  | 28
  | 30
  | 60
  | 90
  | 180
  | 365;

export interface Achievement {
  id: StreakDays;
  name: string;
  description: string;
  icon: string;
  days: number;
}

export type CompletionStatus =
  | 'no_habits'
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
  lastSyncTime: Date;
  isLoading: boolean;
  error: string | null;
}

export interface HabitsState extends BaseState {
  habits: Map<string, Habit>;
  completions: Map<string, HabitCompletion>;
  pendingOperations: PendingOperation[];
}

interface CachedDayStatus {
  date: string;
  status: CompletionStatus;
  lastUpdated: number;
}

interface MonthCache {
  [dateString: string]: CachedDayStatus;
}

export interface HabitSlice {
  habits: Map<string, Habit>;

  addHabit: (
    habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<string>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  getHabitStatus: (habitId: string, date: Date) => HabitCompletion | null;
  getCurrentValue: (habitId: string, date: Date) => number;
  getCurrentProgress: (habitId: string, date: Date) => number;
  getProgressText: (habitId: string, date: Date) => string;
}

export interface CompletionSlice {
  completions: Map<string, HabitCompletion>;

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
}

export type StreakAchievements = {
  [K in StreakDays]?: boolean;
};

export interface AchievementSlice {
  streakAchievements: StreakAchievements;
  currentStreak: number;
  maxStreak: number;
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;

  resetAchievements: () => void;
  setAchievements: (achievements: UserAchievement) => void;
  calculateAndUpdate: (
    completions: Map<string, HabitCompletion>,
    habits: Map<string, Habit>
  ) => {
    unlockedAchievements: StreakDays[];
    currentStreak: number;
  };
}

export interface CalendarSlice {
  monthCache: Map<string, MonthCache>;

  getMonthStatuses: (month: Date) => MonthCache;
  updateDayStatus: (date: Date, status: CompletionStatus) => void;
  getDayStatus: (date: Date) => CachedDayStatus | null;
  calculateDateStatus: (date: Date) => CompletionStatus;
  updateAffectedDates: (habitId: string) => void;
}

export interface SyncSlice {
  pendingOperations: PendingOperation[];

  syncWithServer: () => Promise<void>;
  processPendingOperations: () => Promise<void>;
}

export type SharedSlice = HabitSlice &
  CompletionSlice &
  CalendarSlice &
  SyncSlice &
  AchievementSlice &
  BaseState;
