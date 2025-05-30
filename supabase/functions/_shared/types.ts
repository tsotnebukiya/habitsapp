// Shared type definitions for Supabase Edge Functions

// Base user interface (from daily-update-note and habits-note)
export interface BaseUser {
  id: string;
  push_token: string;
  timezone: string;
  preferred_language: string;
}

// User with achievements (from streak-note)
export interface UserWithAchievements {
  id: string;
  push_token: string;
  timezone: string;
  preferred_language: string;
  streak_achievements: Record<string, boolean>;
}

// User with current streak (from streak-note)
export interface UserWithCurrentStreak extends UserWithAchievements {
  current_streak: number;
}

// Generic user with habits using intersection types
export type UserWithHabits<T extends BaseUser = BaseUser> = T & {
  habits: (Habit & { completions: HabitCompletion[] })[];
};

// Specific implementations
export type UserWithHabitsBasic = UserWithHabits<BaseUser>;
export type UserWithHabitsAndAchievements =
  UserWithHabits<UserWithAchievements>;

// Habit interface (identical across all 3 files)
export interface Habit {
  id: string;
  name: string;
  user_id: string;
  reminder_time: string | null;
  days_of_week: number[] | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  frequency_type: 'daily' | 'weekly';
}

// HabitCompletion interface (identical across all 3 files)
export interface HabitCompletion {
  id: string;
  habit_id: string;
  completion_date: string;
  created_at: string;
  status: 'not_started' | 'skipped' | 'completed' | 'in_progress';
  user_id: string;
  value: number | null;
}

// Unified NotificationData interface (covers all variations)
export interface NotificationData {
  user_id: string;
  habit_id?: string;
  title: string;
  body: string;
  notification_type: 'MORNING' | 'EVENING' | 'STREAK' | 'HABIT';
  scheduled_for: string;
  processed: boolean;
  data?: {
    habit_id: string;
    color: string;
    icon: string;
  };
}
