// Shared database query functions for Supabase Edge Functions
import dayjs from 'dayjs';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import {
  BaseUser,
  Habit,
  HabitCompletion,
  UserWithAchievements,
} from './types.ts';

// Get users with push tokens (from daily-update-note - with notification filter)
export async function getUsersWithPushTokensForDailyUpdate(
  supabaseClient: SupabaseClient
): Promise<BaseUser[]> {
  const { data: users, error } = await supabaseClient
    .from('users')
    .select('id, push_token, timezone, preferred_language')
    .not('push_token', 'is', null)
    .is('allow_daily_update_notifications', true);

  if (error) throw error;
  return users || [];
}

// Get users with push tokens (from habits-note - no notification filter)
export async function getUsersWithPushTokensForHabits(
  supabaseClient: SupabaseClient
): Promise<BaseUser[]> {
  const { data: users, error } = await supabaseClient
    .from('users')
    .select('id, push_token, timezone, preferred_language')
    .not('push_token', 'is', null);

  if (error) throw error;
  return users || [];
}

// Get users with achievements (from streak-note)
export async function getUsersWithAchievements(
  supabase: SupabaseClient
): Promise<UserWithAchievements[]> {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      push_token,
      timezone,
      preferred_language,
      user_achievements!inner (
        streak_achievements
      )
    `
    )
    .not('push_token', 'is', null)
    .is('allow_streak_notifications', true);

  if (error) {
    console.error('Error fetching users with achievements:', error);
    throw error;
  }

  return data.map((user: any) => ({
    id: user.id,
    push_token: user.push_token!,
    timezone: user.timezone,
    preferred_language: user.preferred_language,
    streak_achievements: user.user_achievements.streak_achievements as Record<
      string,
      boolean
    >,
  }));
}

// Get habit completions (identical in daily-update-note and habits-note)
export async function getHabitCompletionsForDate(
  supabaseClient: SupabaseClient,
  habitIds: string[],
  completionDate: string
): Promise<HabitCompletion[]> {
  const { data: completions, error } = await supabaseClient
    .from('habit_completions')
    .select('*')
    .in('habit_id', habitIds)
    .eq('completion_date', completionDate);

  if (error) throw error;
  return completions || [];
}

// Get habit completions (from streak-note - no date filter)
export async function getHabitCompletionsAll(
  supabaseClient: SupabaseClient,
  habitIds: string[]
): Promise<HabitCompletion[]> {
  const { data: completions, error } = await supabaseClient
    .from('habit_completions')
    .select('*')
    .in('habit_id', habitIds);

  if (error) throw error;
  return completions || [];
}

// Get active habits (from streak-note - basic version)
export async function getActiveHabitsBasic(
  supabaseClient: SupabaseClient,
  userIds: string[]
): Promise<Habit[]> {
  const { data, error } = await supabaseClient
    .from('habits')
    .select('*')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
}

// Get active habits (from daily-update-note - with date and frequency filtering)
export async function getActiveHabitsForDate(
  supabaseClient: SupabaseClient,
  userIds: string[],
  date: string
): Promise<Habit[]> {
  const dayOfWeek = dayjs(date).day();

  const { data, error } = await supabaseClient
    .from('habits')
    .select('*')
    .in('user_id', userIds)
    .eq('is_active', true)
    .lte('start_date', date)
    // Handle (end_date is null OR end_date >= date)
    .or(`end_date.is.null,end_date.gte.${date}`)
    // Frequency logic:
    // (frequency_type = 'daily') OR (frequency_type = 'weekly' AND days_of_week contains dayOfWeek)
    .or(
      `frequency_type.eq.daily,and(frequency_type.eq.weekly,days_of_week.cs.{${dayOfWeek}})`
    );

  if (error) throw error;
  return data || [];
}

// Get active habits (from habits-note - with date, frequency, and reminder_time filtering)
export async function getActiveHabitsWithReminders(
  supabaseClient: SupabaseClient,
  userIds: string[],
  date: string
): Promise<Habit[]> {
  const dayOfWeek = dayjs(date).day();

  const { data, error } = await supabaseClient
    .from('habits')
    .select('*')
    .in('user_id', userIds)
    .eq('is_active', true)
    .not('reminder_time', 'is', null)
    .lte('start_date', date)
    .or(`end_date.is.null,end_date.gte.${date}`)
    .or(
      `frequency_type.eq.daily,and(frequency_type.eq.weekly,days_of_week.cs.{${dayOfWeek}})`
    );
  if (error) throw error;
  return data || [];
}
