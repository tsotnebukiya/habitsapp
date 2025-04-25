// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);
dayjs.extend(utc);

export interface User {
  id: string;
  push_token: string;
  timezone: string;
}

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
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completion_date: string;
  created_at: string;
  status: 'not_started' | 'skipped' | 'completed' | 'in_progress';
  user_id: string;
  value: number | null;
}

export interface UserWithHabits extends User {
  habits: (Habit & { completions: HabitCompletion[] })[];
}

export interface NotificationData {
  user_id: string;
  title: string;
  body: string;
  notification_type: 'MORNING' | 'EVENING';
  scheduled_for: string;
  processed: boolean;
}

export async function getUsersWithPushTokens(
  supabaseClient: SupabaseClient
): Promise<User[]> {
  const { data: users, error } = await supabaseClient
    .from('users')
    .select('id, push_token, timezone')
    .not('push_token', 'is', null);

  if (error) throw error;
  return users || [];
}

export async function getActiveHabits(
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

export async function getHabitCompletions(
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

export function groupHabitsAndCompletions(
  users: User[],
  habits: Habit[],
  completions: HabitCompletion[]
): UserWithHabits[] {
  // Create a Map for faster lookups
  const completionsByHabit = new Map<string, HabitCompletion[]>();
  for (const completion of completions) {
    if (!completionsByHabit.has(completion.habit_id)) {
      completionsByHabit.set(completion.habit_id, []);
    }
    completionsByHabit.get(completion.habit_id)!.push(completion);
  }

  const habitsByUser = new Map<
    string,
    (Habit & { completions: HabitCompletion[] })[]
  >();
  for (const habit of habits) {
    if (!habitsByUser.has(habit.user_id)) {
      habitsByUser.set(habit.user_id, []);
    }
    habitsByUser.get(habit.user_id)!.push({
      ...habit,
      completions: completionsByHabit.get(habit.id) || [],
    });
  }

  return users.map((user) => ({
    ...user,
    habits: habitsByUser.get(user.id) || [],
  }));
}

export function isNextHourTarget(
  userTimezone: string,
  targetHour: number
): boolean {
  const nextHour = dayjs()
    .tz(userTimezone || 'UTC')
    .add(1, 'hour')
    .hour();
  return nextHour === targetHour;
}

export function prepareNotifications(
  usersWithData: UserWithHabits[],
  morningHour: number,
  eveningHour: number
): NotificationData[] {
  const scheduledNotifications: NotificationData[] = [];

  for (const user of usersWithData) {
    const isMorningNext = isNextHourTarget(user.timezone, morningHour);
    const isEveningNext = isNextHourTarget(user.timezone, eveningHour);

    if (!isMorningNext && !isEveningNext) {
      continue; // Skip if next hour isn't a target hour
    }

    const scheduledTime = dayjs()
      .tz(user.timezone || 'UTC')
      .add(1, 'hour')
      .hour(isMorningNext ? morningHour : eveningHour)
      .minute(0)
      .second(0)
      .millisecond(0);

    if (isMorningNext) {
      // Morning notification
      if (user.habits.length === 0) {
        scheduledNotifications.push({
          user_id: user.id,
          title: 'Start Your Day Right!',
          body: 'Time to create some healthy habits! Add your first habit to get started. 🌟',
          notification_type: 'MORNING',
          scheduled_for: scheduledTime.toISOString(),
          processed: false,
        });
      } else {
        scheduledNotifications.push({
          user_id: user.id,
          title: 'Start Your Day Right!',
          body: "Time to kickstart your daily habits! You've got this! 💫",
          notification_type: 'MORNING',
          scheduled_for: scheduledTime.toISOString(),
          processed: false,
        });
      }
    } else if (isEveningNext && user.habits.length > 0) {
      // Evening notification (only for users with habits)
      const completedHabits = user.habits.filter((habit) =>
        habit.completions.some((c) => c.status === 'completed')
      );

      const completionRate =
        (completedHabits.length / user.habits.length) * 100;

      let message;
      if (completionRate === 100) {
        message = "Amazing job! You've completed all your habits today! 🎉";
      } else if (completionRate >= 75) {
        message = `Great progress! You've completed ${completedHabits.length} out of ${user.habits.length} habits. Keep going! 💪`;
      } else if (completionRate >= 50) {
        message = `You're halfway there! ${
          completedHabits.length
        } habits done, ${
          user.habits.length - completedHabits.length
        } to go. 🎯`;
      } else if (completionRate > 0) {
        message = `You've made a start with ${completedHabits.length} habit${
          completedHabits.length === 1 ? '' : 's'
        }. There's still time to complete more! 🚀`;
      } else {
        message =
          "Don't forget about your habits! There's still time to make progress today. ✨";
      }

      scheduledNotifications.push({
        user_id: user.id,
        title: 'Daily Habits Update',
        body: message,
        notification_type: 'EVENING',
        scheduled_for: scheduledTime.toISOString(),
        processed: false,
      });
    }
  }

  return scheduledNotifications;
}
