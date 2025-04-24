# Notification System Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive notification system for our Habits app using Supabase Edge Functions. The system will support:

1. Morning/Evening notifications at 7am/7pm in the user's timezone
2. Streak achievement notifications at 2pm in the user's timezone
3. Habit-specific reminders at times set by users

All notifications will respect user timezones, which will be updated whenever the app starts.

## Current Implementation

- We have a `notifications` table in the database with fields including user_id, title, body, scheduled_for, notification_type, etc.
- We have an existing function in `supabase/functions/index.ts` that handles database webhook events to send notifications via Expo service
- We have a `useNotifications` hook that sets up notification handling and registers the device push token
- The `users` table already has a `timezone` field that needs to be kept up to date

## Implementation Plan

### 1. Update User Timezone on App Start

Modify the useNotifications hook to update the user's timezone whenever the app starts:

```typescript
// In lib/hooks/useNotifications.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

// Inside setupNotifications function
async function setupNotifications() {
  // Existing code for notification permissions

  // Update user timezone
  if (userId) {
    const currentTimezone = dayjs.tz.guess(); // Get current device timezone
    await supabase
      .from('users')
      .update({ timezone: currentTimezone })
      .eq('id', userId);
  }

  // Rest of existing function
}
```

### 2. Create Timezone Utilities

Add utility functions for timezone conversions:

```typescript
// supabase/functions/utils/timezone-utils.ts
export function getTimezoneOffset(timezone: string): number {
  // Simple implementation for common timezone formats
  if (timezone === 'UTC') return 0;

  // Handle Etc/GMT+X format
  if (timezone.startsWith('Etc/GMT')) {
    // Note: Etc/GMT+5 means UTC-5, so we negate the offset
    const sign = timezone.includes('+') ? -1 : 1;
    const hours = parseInt(timezone.split(/[+-]/)[1], 10);
    return sign * hours;
  }

  // For more complex timezones (e.g., America/New_York),î
  // we would need to use a timezone database
  const commonTimezones: Record<string, number> = {
    'America/New_York': -5, // EST
    'America/Los_Angeles': -8, // PST
    'Europe/London': 0, // GMT
    'Europe/Paris': 1, // CET
    'Asia/Tokyo': 9,
    // Add more as needed
  };

  return commonTimezones[timezone] || 0;
}

// For a more comprehensive solution, consider using a timezone database
// or service to handle DST and more complex timezone rules
```

### 3. Create Notification Scheduler Edge Function

Create a scheduler function that will handle all scheduled notifications:

```typescript
// supabase/functions/scheduler/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { getTimezoneOffset } from '../utils/timezone-utils';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    // 1. Process morning/evening notifications
    await processTimedNotifications();

    // 2. Process streak notifications
    await processStreakNotifications();

    // 3. Process habit-specific reminders
    await processHabitReminders();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Morning/Evening notifications based on user timezone
async function processTimedNotifications() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  // Only process if we're at the start of the hour (0-5 minutes past)
  if (utcMinute > 5) return;

  // Get all users with their timezones
  const { data: users } = await supabase
    .from('users')
    .select('id, timezone, push_token');

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (!user.push_token || !user.timezone) continue;

    const userOffset = getTimezoneOffset(user.timezone);
    const userLocalHour = (utcHour + userOffset + 24) % 24;

    // Morning notification at 7am
    if (userLocalHour === 7) {
      await createMorningNotification(user.id);
    }

    // Evening notification at 7pm
    if (userLocalHour === 19) {
      await createEveningNotification(user.id);
    }
  }
}

// Create morning notification with habit summary
async function createMorningNotification(userId) {
  // Get user's habits for today
  // Generate summary text
  // Insert notification to trigger webhook
  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Good Morning',
    body: 'Here are your habits for today',
    notification_type: 'morning_summary',
    data: {
      /* summary data */
    },
  });
}

// Create evening notification with habit summary
async function createEveningNotification(userId) {
  // Get user's habits and completion status
  // Generate summary text
  // Insert notification
  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Daily Summary',
    body: "Here's how you did today",
    notification_type: 'evening_summary',
    data: {
      /* summary data */
    },
  });
}

// Check for users approaching streak milestones
async function processStreakNotifications() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  // Only process if we're near 2pm local time for users
  if (utcMinute > 5) return;

  // Get users with their current streaks
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('user_id, current_streak, streak_achievements');

  if (!userAchievements || userAchievements.length === 0) return;

  // Get user timezones
  const { data: users } = await supabase
    .from('users')
    .select('id, timezone')
    .in(
      'id',
      userAchievements.map((a) => a.user_id)
    );

  if (!users || users.length === 0) return;

  // Create map of user_id to timezone
  const userTimezones = new Map(users.map((u) => [u.id, u.timezone]));

  for (const achievement of userAchievements) {
    const userTimezone = userTimezones.get(achievement.user_id);
    if (!userTimezone) continue;

    const userOffset = getTimezoneOffset(userTimezone);
    const userLocalHour = (utcHour + userOffset + 24) % 24;

    // Check if it's 2pm in user's timezone
    if (userLocalHour === 14) {
      // Check if user is within 2 days of next milestone
      const nextMilestone = getNextMilestone(
        achievement.current_streak,
        achievement.streak_achievements
      );

      if (nextMilestone && nextMilestone - achievement.current_streak <= 2) {
        await createStreakNotification(
          achievement.user_id,
          achievement.current_streak,
          nextMilestone
        );
      }
    }
  }
}

// Helper to get next uncompleted milestone
function getNextMilestone(currentStreak, streakAchievements) {
  const milestones = [1, 3, 7, 10, 14, 21, 28, 30, 60, 90, 180, 365];
  return milestones.find((m) => m > currentStreak && !streakAchievements[m]);
}

// Create streak notification
async function createStreakNotification(userId, currentStreak, nextMilestone) {
  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Streak Achievement',
    body: `You're only ${
      nextMilestone - currentStreak
    } days away from a ${nextMilestone}-day streak!`,
    notification_type: 'streak_achievement',
    data: { currentStreak, nextMilestone },
  });
}

// Process habit-specific reminders
async function processHabitReminders() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  // Get all habits with reminders
  const { data: habitsWithReminders } = await supabase
    .from('habits')
    .select('id, user_id, name, reminder_time')
    .not('reminder_time', 'is', null);

  if (!habitsWithReminders || habitsWithReminders.length === 0) return;

  // Get users with their timezones
  const { data: users } = await supabase
    .from('users')
    .select('id, timezone')
    .in(
      'id',
      habitsWithReminders.map((h) => h.user_id)
    );

  if (!users || users.length === 0) return;

  // Create a map of user_id to timezone
  const userTimezones = new Map(users.map((u) => [u.id, u.timezone]));

  for (const habit of habitsWithReminders) {
    const userTimezone = userTimezones.get(habit.user_id);
    if (!userTimezone) continue;

    // Calculate if the habit reminder time is now in user's timezone
    const reminderTime = new Date(`1970-01-01T${habit.reminder_time}Z`);
    const reminderHour = reminderTime.getUTCHours();
    const reminderMinute = reminderTime.getUTCMinutes();

    const userOffset = getTimezoneOffset(userTimezone);
    const userLocalHour = (utcHour + userOffset + 24) % 24;

    // Check if current time matches reminder time (with 1-minute window)
    if (userLocalHour === reminderHour && utcMinute === reminderMinute) {
      await createHabitReminder(habit);
    }
  }
}

async function createHabitReminder(habit) {
  // Insert notification for this habit
  await supabase.from('notifications').insert({
    user_id: habit.user_id,
    title: 'Habit Reminder',
    body: `Time to complete your habit: ${habit.name}`,
    notification_type: 'habit_reminder',
    data: { habit_id: habit.id },
  });
}
```

## Alternative Approaches for Habit-Specific Reminders

### Option 1: One-minute scheduler (as shown above)

- Pros: Simple, direct implementation
- Cons: Requires frequent function execution (every minute)

### Option 2: Schedule notifications in advance

- Schedule all notifications for the day at midnight in user's timezone
- Pros: More efficient, fewer function executions
- Cons: More complex to implement, less flexible for changes

### Option 3: Use a third-party scheduling service

- Use a service like Upstash Qstash for precise scheduling
- Pros: Most precise, handles edge cases well
- Cons: Requires additional service dependency

For initial implementation, Option 1 is recommended for simplicity.

## Deployment and Setup

### File Structure

```
supabase/
├── functions/
│   ├── index.ts                  # Main notification sending function (existing)
│   ├── utils/
│   │   └── timezone-utils.ts     # Timezone utilities
│   ├── scheduler/                # Scheduled notifications
│   │   └── index.ts              # Main scheduler logic
```

### Implementation Steps

1. Create timezone utilities
2. Update the frontend to update timezone on app start
3. Create the scheduler function
4. Set up CRON trigger for the scheduler (e.g., every minute)
5. Test and refine

### Testing Considerations

1. Test with users in different timezones
2. Verify notifications sent at correct local times
3. Test timezone changes (e.g., travel scenarios)
4. Verify handling of different notification types

## Future Enhancements

1. Add more sophisticated timezone handling (including DST)
2. Implement notification preferences and settings
3. Add analytics to track notification effectiveness
4. Optimize scheduler frequency based on usage patterns
