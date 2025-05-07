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

const morningNotificationTemplates = [
  // For users with NO habits
  {
    noHabits: [
      { title: 'Morning Reminder! ☀️', body: 'Create your first habit today!' },
      { title: 'Fresh Start! 🌱', body: 'Add a habit to build your routine.' },
      { title: 'New Day, New Habits! 🌟', body: 'Start your journey today.' },
      { title: 'Good Morning! ☕', body: 'Ready to add your first habit?' },
      { title: 'Rise & Shine! 🌞', body: 'Time to create healthy habits.' },
    ],
    // For users WITH habits
    hasHabits: [
      { title: 'Morning Check-in! ☀️', body: 'Time for your daily habits!' },
      { title: "Let's Go! 🚀", body: 'Your habits are waiting for you.' },
      { title: 'Fresh Day Ahead! 💫', body: 'Ready to tackle your habits?' },
      { title: 'Rise & Thrive! 🌞', body: 'Check off those habits today!' },
      { title: 'Good Morning! ☕', body: 'Habits build success. Start now!' },
    ],
  },
];

const eveningNotificationTemplates = [
  // 100% completion
  {
    complete: [
      { title: 'Perfect Day! 🏆', body: 'All habits complete! Amazing work!' },
      { title: 'Flawless! 🎯', body: 'You finished all your habits today!' },
      { title: 'Champion! 🥇', body: '100% complete. Incredible job!' },
      { title: 'Success! ✅', body: 'All habits done. Feel the progress!' },
      { title: 'Stellar Day! 🌟', body: 'Full completion! Keep it up!' },
    ],
    // 50%+ completion
    mediumProgress: [
      {
        title: 'Halfway There! 🚀',
        body: '{count}/{total} habits done today!',
      },
      { title: 'Good Progress! 👍', body: '{count} done, {remaining} to go.' },
      { title: 'Keep Going! 💯', body: "You've done half your habits!" },
      { title: 'Mid-Day Check! ⏱️', body: '{count} down, {remaining} to go!' },
      { title: 'Solid Start! 👊', body: 'Half complete! Finish strong!' },
    ],
    // 1-49% completion
    lowProgress: [
      {
        title: 'Started Today! 🌱',
        body: '{count} habit(s) done, more to go!',
      },
      {
        title: 'Keep Going! 👣',
        body: '{count} down, {remaining} to complete!',
      },
      {
        title: 'Progress Update! 📊',
        body: '{count}/{total} habits complete.',
      },
      { title: 'Time Check! ⏰', body: 'Still time to complete more habits!' },
      { title: "You've Begun! 🚀", body: 'Continue your progress today!' },
    ],
    // 0% completion
    noProgress: [
      {
        title: 'Habits Waiting! ⏰',
        body: 'Still time to make progress today!',
      },
      { title: 'Check-in Time! 📝', body: "Start a habit before day's end!" },
      { title: 'Reminder! 🔔', body: 'Your habits need attention today.' },
      { title: 'Evening Update! 🌙', body: 'Complete a habit before bedtime!' },
      {
        title: 'Not Too Late! ✨',
        body: 'A few minutes can make a difference!',
      },
    ],
  },
];

export async function getUsersWithPushTokens(
  supabaseClient: SupabaseClient
): Promise<User[]> {
  const { data: users, error } = await supabaseClient
    .from('users')
    .select('id, push_token, timezone')
    .not('push_token', 'is', null)
    .is('allow_daily_update_notifications', true);

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
      // Morning notification - random selection
      const templates =
        user.habits.length === 0
          ? morningNotificationTemplates[0].noHabits
          : morningNotificationTemplates[0].hasHabits;

      const randomIndex = Math.floor(Math.random() * templates.length);
      const template = templates[randomIndex];

      scheduledNotifications.push({
        user_id: user.id,
        title: template.title,
        body: template.body,
        notification_type: 'MORNING',
        scheduled_for: scheduledTime.toISOString(),
        processed: false,
      });
    } else if (isEveningNext && user.habits.length > 0) {
      // Evening notification (only for users with habits)
      const completedHabits = user.habits.filter((habit) =>
        habit.completions.some((c) => c.status === 'completed')
      );

      const completionRate =
        (completedHabits.length / user.habits.length) * 100;
      let templates;

      if (completionRate === 100) {
        templates = eveningNotificationTemplates[0].complete;
      } else if (completionRate >= 50) {
        templates = eveningNotificationTemplates[0].mediumProgress;
      } else if (completionRate > 0) {
        templates = eveningNotificationTemplates[0].lowProgress;
      } else {
        templates = eveningNotificationTemplates[0].noProgress;
      }

      const randomIndex = Math.floor(Math.random() * templates.length);
      const template = templates[randomIndex];

      // Replace placeholders with actual values
      const body = template.body
        .replace(/{count}/g, completedHabits.length.toString())
        .replace(/{total}/g, user.habits.length.toString())
        .replace(
          /{remaining}/g,
          (user.habits.length - completedHabits.length).toString()
        );

      scheduledNotifications.push({
        user_id: user.id,
        title: template.title,
        body: body,
        notification_type: 'EVENING',
        scheduled_for: scheduledTime.toISOString(),
        processed: false,
      });
    }
  }

  return scheduledNotifications;
}
