// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isBetween);

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
  habit_id?: string;
  title: string;
  body: string;
  notification_type: 'MORNING' | 'EVENING' | 'HABIT';
  scheduled_for: string;
  processed: boolean;
  data?: {
    habit_id: string;
    color: string;
    icon: string;
  };
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
    .not('reminder_time', 'is', null)
    .lte('start_date', date)
    .or(`end_date.is.null,end_date.gte.${date}`)
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
  usersWithHabits: UserWithHabits[]
): NotificationData[] {
  const notifications: NotificationData[] = [];

  for (const user of usersWithHabits) {
    // Get next hour in user's timezone
    const userNextHour = dayjs().tz(user.timezone).add(1, 'hour').hour();

    console.log('Processing user timezone:', {
      userId: user.id,
      timezone: user.timezone,
      nextHour: userNextHour,
      totalHabits: user.habits.length,
    });

    // Filter habits that:
    // 1. Haven't been completed/skipped
    // 2. Have reminder_time in the next hour of user's timezone
    const habitsToNotify = user.habits.filter((habit) => {
      // Check completion status
      const isNotCompleted = !habit.completions.some(
        (completion) =>
          completion.status === 'completed' || completion.status === 'skipped'
      );

      // Parse reminder time hour
      const reminderHour = parseInt(habit.reminder_time!.split(':')[0]);

      // Check if reminder falls in next hour
      const isInNextHour = reminderHour === userNextHour;

      console.log('Checking habit:', {
        habitId: habit.id,
        habitName: habit.name,
        reminderTime: habit.reminder_time,
        reminderHour,
        nextHour: userNextHour,
        isNotCompleted,
        isInNextHour,
      });

      return isNotCompleted && isInNextHour;
    });

    console.log('Filtered habits:', {
      userId: user.id,
      totalHabitsToNotify: habitsToNotify.length,
    });

    // Create notifications for filtered habits
    notifications.push(
      ...habitsToNotify.map((habit) => {
        // Create scheduled_for time in UTC
        const [hours, minutes] = habit.reminder_time!.split(':');
        const scheduledTime = dayjs()
          .tz(user.timezone)
          .hour(parseInt(hours))
          .minute(parseInt(minutes))
          .second(0)
          .utc()
          .format();

        return {
          user_id: user.id,
          habit_id: habit.id,
          title: `Hey! ${habit.name} Time ✨`,
          body: `A few minutes of ${habit.name.toLowerCase()} will make your day better`,
          notification_type: 'HABIT' as const,
          scheduled_for: scheduledTime,
          processed: false,
        };
      })
    );
  }

  return notifications;
}
