// Setup type definitions for built-in Supabase Runtime APIs
import dayjs from 'dayjs';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  Habit,
  HabitCompletion,
  NotificationData,
  UserWithCurrentStreak,
  UserWithHabitsAndAchievements,
} from '../_shared/types.ts';
import { getTemplates, selectRandomTemplate } from '../_shared/utils.ts';

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
  usersWithHabits: UserWithHabitsAndAchievements[]
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
  users: UserWithCurrentStreak[],
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

    // Get templates in user's preferred language
    const templates = getTemplates(user.preferred_language, 'streak');
    const template = selectRandomTemplate(templates);

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
