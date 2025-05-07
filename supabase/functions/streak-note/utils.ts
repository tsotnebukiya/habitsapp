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

export interface UserWithHabits extends UserWithAchievements {
  habits: (Habit & { completions: HabitCompletion[] })[];
}

export interface UsersWithCurrentStreak extends UserWithAchievements {
  current_streak: number;
}

type UserWithAchievements = {
  id: string;
  push_token: string;
  timezone: string;
  streak_achievements: Record<string, boolean>;
};

const streakNotificationTemplates = [
  {
    title: 'Almost at a {milestone}-Day Streak! 🎯',
    body: 'Just 2 more days to reach this milestone!',
  },
  {
    title: '{milestone}-Day Streak Approaching! ✨',
    body: "You're just 2 days away. Keep going!",
  },
  {
    title: 'Streak Alert: {milestone} Days! 🔥',
    body: '2 more days until you hit this milestone!',
  },
  {
    title: 'Close to Your {milestone}-Day Goal! 💪',
    body: "Don't break your streak now - 2 days to go!",
  },
  {
    title: 'Achievement Unlocking Soon! 🏆',
    body: 'Your {milestone}-day streak is just 2 days away!',
  },
  {
    title: '{milestone}-Day Streak Loading... ⏳',
    body: 'Almost there! Just 2 more days!',
  },
  {
    title: 'Streak Check: {milestone} Days Soon! 📈',
    body: 'Stay consistent for 2 more days!',
  },
  {
    title: 'Big Milestone Ahead! 🌟',
    body: 'Your {milestone}-day streak is 2 days away!',
  },
  {
    title: 'Victory in Sight! 🎉',
    body: 'Keep going for your {milestone}-day achievement!',
  },
  {
    title: '2 Days to Your {milestone}-Day Goal! 🚀',
    body: 'Stay on track for this streak milestone!',
  },
];

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

export async function getActiveHabits(
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

export async function getHabitCompletions(
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

export function groupHabitsAndCompletions(
  users: UserWithAchievements[],
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

function calculateCurrentStreak(
  habits: Habit[],
  completions: HabitCompletion[]
): number {
  // Create maps for faster lookups
  const habitsMap = new Map(habits.map((h) => [h.id, h]));

  // Normalize dates for completions
  const completionsByDate = new Map<string, Set<string>>();

  for (const completion of completions) {
    const dateKey = dayjs.utc(completion.completion_date).format('YYYY-MM-DD');

    if (!completionsByDate.has(dateKey)) {
      completionsByDate.set(dateKey, new Set());
    }

    if (completion.status === 'completed' || completion.status === 'skipped') {
      completionsByDate.get(dateKey)!.add(completion.habit_id);
    }
  }

  // Sort dates in descending order
  const dates = Array.from(completionsByDate.keys()).sort((a, b) =>
    b.localeCompare(a)
  );

  // Calculate streak
  let streak = 0;
  let prevDate = dayjs.utc().format('YYYY-MM-DD');

  for (const date of dates) {
    // Check for gap in dates
    const dayDiff = dayjs.utc(prevDate).diff(dayjs.utc(date), 'day');
    if (dayDiff > 1) break;

    // Get active habits for this date
    const activeHabits = habits.filter((habit) => {
      const startDate = dayjs.utc(habit.created_at).format('YYYY-MM-DD');
      const endDate = habit.end_date
        ? dayjs.utc(habit.end_date).format('YYYY-MM-DD')
        : null;

      return date >= startDate && (!endDate || date <= endDate);
    });

    // Skip days with no active habits
    if (activeHabits.length === 0) {
      prevDate = date;
      continue;
    }

    // Check if all active habits are completed
    const completed = completionsByDate.get(date) || new Set();
    const allCompleted = activeHabits.every((h) => completed.has(h.id));

    if (!allCompleted) break;

    streak++;
    prevDate = date;
  }

  return streak;
}

export function calculateUserStreaks(
  usersWithHabits: UserWithHabits[]
): { userId: string; currentStreak: number }[] {
  const results = [];

  for (const user of usersWithHabits) {
    // Extract all user's habits and completions
    const habits = user.habits;
    const allCompletions = habits.flatMap((habit) => habit.completions);

    // Calculate current streak using similar logic to achievements.ts
    const currentStreak = calculateCurrentStreak(habits, allCompletions);

    results.push({
      userId: user.id,
      currentStreak,
    });
  }

  return results;
}

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
  users: UsersWithCurrentStreak[],
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

    // Select random template
    const randomIndex = Math.floor(
      Math.random() * streakNotificationTemplates.length
    );
    const template = streakNotificationTemplates[randomIndex];

    // Replace the milestone placeholder with the actual number
    const title = template.title.replace(
      /{milestone}/g,
      nextMilestone.toString()
    );
    const body = template.body.replace(
      /{milestone}/g,
      nextMilestone.toString()
    );

    notifications.push({
      user_id: user.id,
      title,
      body,
      notification_type: 'STREAK',
      scheduled_for: scheduledFor,
      processed: false,
    });
  }

  return notifications;
};
