// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export interface NotificationData {
  user_id: string;
  title: string;
  body: string;
  notification_type: 'MORNING' | 'EVENING' | 'STREAK';
  scheduled_for: string;
  processed: boolean;
}

type UserWithAchievements = {
  id: string;
  push_token: string;
  timezone: string;
  current_streak: number;
  streak_achievements: Record<string, boolean>;
};

export const getUsersWithAchievements = async (
  supabase: SupabaseClient
): Promise<UserWithAchievements[]> => {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      push_token,
      timezone,
      user_achievements!inner (
        current_streak,
        streak_achievements
      )
    `
    )
    .not('push_token', 'is', null);

  if (error) {
    console.error('Error fetching users with achievements:', error);
    throw error;
  }

  return data.map((user: any) => ({
    id: user.id,
    push_token: user.push_token!,
    timezone: user.timezone,
    current_streak: user.user_achievements.current_streak,
    streak_achievements: user.user_achievements.streak_achievements as Record<
      string,
      boolean
    >,
  }));
};

export const isNextHourTarget = (
  userTimezone: string,
  targetHour: number
): boolean => {
  const userNow = dayjs().tz(userTimezone);
  const userNextHour = userNow.add(1, 'hour').hour();
  return userNextHour === targetHour;
};

export const getNextStreakMilestone = (
  streakAchievements: Record<string, boolean>
): number | null => {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];

  for (const milestone of milestones) {
    const key = `streak_${milestone}`;
    if (!streakAchievements[key]) {
      return milestone;
    }
  }

  return null;
};

export const prepareNotifications = (
  users: UserWithAchievements[],
  targetHour: number
): NotificationData[] => {
  const notifications: NotificationData[] = [];
  const now = dayjs();

  for (const user of users) {
    const nextMilestone = getNextStreakMilestone(user.streak_achievements);
    if (!nextMilestone) {
      continue;
    }

    const daysToMilestone = nextMilestone - user.current_streak;
    if (daysToMilestone !== 2) {
      continue;
    }

    const userLocalTime = now.tz(user.timezone);
    const scheduledFor = userLocalTime
      .hour(targetHour)
      .minute(0)
      .second(0)
      .add(1, 'hour')
      .toISOString();

    notifications.push({
      user_id: user.id,
      title: 'Almost There! 🎯',
      body: `Keep going! You're just 2 days away from a ${nextMilestone}-day streak achievement!`,
      notification_type: 'STREAK',
      scheduled_for: scheduledFor,
      processed: false,
    });
  }

  return notifications;
};
