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
  completions: HabitCompletion[],
  userTimezone: string
): number {
  // Normalize dates for completions using user timezone
  const completionsByDate = new Map<string, Set<string>>();

  for (const completion of completions) {
    const dateKey = dayjs(completion.completion_date)
      .tz(userTimezone)
      .format('YYYY-MM-DD');

    if (!completionsByDate.has(dateKey)) {
      completionsByDate.set(dateKey, new Set());
    }

    if (completion.status === 'completed' || completion.status === 'skipped') {
      completionsByDate.get(dateKey)!.add(completion.habit_id);
    }
  }

  // Helper function to get active habits for a specific date
  const getActiveHabitsForDate = (date: string) => {
    const activeHabits = habits.filter((habit) => {
      const startDate = dayjs(habit.start_date)
        .tz(userTimezone)
        .format('YYYY-MM-DD');
      const endDate = habit.end_date
        ? dayjs(habit.end_date).tz(userTimezone).format('YYYY-MM-DD')
        : null;

      // Check date range
      const inDateRange = date >= startDate && (!endDate || date <= endDate);
      if (!inDateRange) return false;

      // Check frequency
      if (habit.frequency_type === 'daily') {
        return true;
      } else if (habit.frequency_type === 'weekly') {
        const dayOfWeek = dayjs(date).tz(userTimezone).day();
        return habit.days_of_week?.includes(dayOfWeek) ?? false;
      }

      return false;
    });

    return activeHabits;
  };

  // Check today's completions first
  const today = dayjs().tz(userTimezone).format('YYYY-MM-DD');

  const todayActiveHabits = getActiveHabitsForDate(today);
  const todayCompletions = completionsByDate.get(today) || new Set();

  // Check if today is complete
  const todayComplete =
    todayActiveHabits.length > 0 &&
    todayActiveHabits.every((h) => todayCompletions.has(h.id));

  let streak = 0;
  let checkDate = today;

  // If today is complete, start streak at 1 and check from yesterday
  if (todayComplete) {
    streak = 1;
    checkDate = dayjs(today)
      .tz(userTimezone)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
  }
  // Get all completion dates before checkDate, sorted in descending order
  const allCompletionDates = Array.from(completionsByDate.keys());

  // If today is complete, we want dates <= checkDate (which is yesterday)
  // If today is not complete, we want dates < checkDate (which is today)
  const pastDates = allCompletionDates
    .filter((date) => (todayComplete ? date <= checkDate : date < checkDate))
    .sort((a, b) => b.localeCompare(a));

  let prevDate = checkDate;

  for (const date of pastDates) {
    // Check for gap in dates
    const dayDiff = dayjs(prevDate).diff(dayjs(date), 'day');

    if (dayDiff > 1) {
      break;
    }

    // Get active habits for this date
    const activeHabits = getActiveHabitsForDate(date);

    // Skip days with no active habits
    if (activeHabits.length === 0) {
      prevDate = date;
      continue;
    }

    // Check if all active habits are completed
    const completed = completionsByDate.get(date) || new Set();
    const allCompleted = activeHabits.every((h) => completed.has(h.id));

    if (!allCompleted) {
      break;
    }

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
    const currentStreak = calculateCurrentStreak(
      habits,
      allCompletions,
      user.timezone
    );

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
    if (daysToMilestone !== 2 && daysToMilestone !== 1) {
      continue;
    }

    const userLocalTime = now.tz(user.timezone);
    const scheduledFor = dayjs()
      .tz(user.timezone)
      .add(1, 'hour')
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();

    // Get templates in user's preferred language based on days to milestone
    const subsection = daysToMilestone === 2 ? 'twoDay' : 'oneDay';
    const templates = getTemplates(
      user.preferred_language,
      'streak',
      subsection
    );
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
