import { Database } from '@/lib/utils/supabase_types';

export type HabitFrequency = 'daily' | 'weekly';

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

export type Habit = Database['public']['Tables']['habits']['Row'];

export type HabitCompletion =
  Database['public']['Tables']['habit_completions']['Row'];

interface BasePendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: Date;
  retryCount: number;
  lastAttempt?: Date;
}

export interface PendingOperation extends BasePendingOperation {
  table: 'habits' | 'habit_completions';
  data?: Habit | HabitCompletion;
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
  BaseState;
