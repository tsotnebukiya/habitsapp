// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  getUsersWithAchievements,
  prepareNotifications,
  isNextHourTarget,
  getActiveHabits,
  getHabitCompletions,
  groupHabitsAndCompletions,
  calculateUserStreaks,
  type UsersWithCurrentStreak,
} from './utils.ts';

// Configure dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TARGET_HOUR = 14; // 2 PM as specified in plan.md

Deno.serve(async (req) => {
  // Initialize timing object to track performance
  const timing = {
    start: performance.now(),
    clientCreated: 0,
    usersFetched: 0,
    usersFiltered: 0,
    habitsFetched: 0,
    completionsFetched: 0,
    dataGrouped: 0,
    streaksCalculated: 0,
    notificationsPrepared: 0,
    notificationsInserted: 0,
    end: 0,
  };

  try {
    console.log('Starting streak-note function');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('Creating Supabase client');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    timing.clientCreated = performance.now();

    // 1. Get all users with push tokens and their achievements
    console.log('Fetching users with achievements');
    const users = await getUsersWithAchievements(supabaseClient);
    timing.usersFetched = performance.now();
    console.log(
      `Found ${users.length} users with push tokens and achievements`
    );

    // 2. Filter users by target hour
    console.log('Filtering users by target hour');
    const usersInTargetHour = users.filter((user) =>
      isNextHourTarget(user.timezone, TARGET_HOUR)
    );
    timing.usersFiltered = performance.now();
    console.log(`Found ${usersInTargetHour.length} users in target hour`);

    // 3. Get Habits for users
    const habits = await getActiveHabits(
      supabaseClient,
      usersInTargetHour.map((u) => u.id)
    );
    timing.habitsFetched = performance.now();

    // 4. Get completions for habits
    const completions = await getHabitCompletions(
      supabaseClient,
      habits.map((h) => h.id)
    );
    timing.completionsFetched = performance.now();

    // 5. Group habits and completions
    const usersWithHabits = groupHabitsAndCompletions(
      usersInTargetHour,
      habits,
      completions
    );
    timing.dataGrouped = performance.now();

    // 6. Calculate streaks
    const streakResults = calculateUserStreaks(usersWithHabits);
    timing.streaksCalculated = performance.now();

    if (usersInTargetHour.length === 0) {
      timing.end = performance.now();
      logTimingResults(timing);

      return new Response(
        JSON.stringify({
          success: true,
          notificationsScheduled: 0,
          usersInTargetHour: 0,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. Map streak results back to users for notifications
    const usersWithCurrentStreak = streakResults
      .map((result) => {
        const user = usersInTargetHour.find((u) => u.id === result.userId);
        if (!user) return null; // Skip if user not found

        // Create a properly typed object with all required fields
        return {
          id: user.id,
          push_token: user.push_token,
          timezone: user.timezone,
          streak_achievements: user.streak_achievements,
          current_streak: result.currentStreak,
        };
      })
      .filter((user): user is UsersWithCurrentStreak => user !== null); // Type predicate

    // 3. Prepare notifications for eligible users
    console.log('Preparing notifications');
    const scheduledNotifications = prepareNotifications(
      usersWithCurrentStreak,
      TARGET_HOUR
    );
    timing.notificationsPrepared = performance.now();
    console.log(`Prepared ${scheduledNotifications.length} notifications`);

    // 4. Insert scheduled notifications into the database
    if (scheduledNotifications.length > 0) {
      console.log('Inserting notifications into database');
      const { error } = await supabaseClient
        .from('notifications')
        .insert(scheduledNotifications);

      if (error) {
        console.error('Error inserting notifications:', error);
        throw error;
      }
      console.log('Successfully inserted notifications');
    }
    timing.notificationsInserted = performance.now();

    timing.end = performance.now();
    logTimingResults(timing);

    return new Response(
      JSON.stringify({
        success: true,
        notificationsScheduled: scheduledNotifications.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in streak-note function:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }

    // If we have timing data, log it even on error
    if (timing.start) {
      timing.end = performance.now();
      logTimingResults(timing);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetails: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to log all timing results at once
function logTimingResults(timing: {
  start: number;
  clientCreated: number;
  usersFetched: number;
  usersFiltered: number;
  habitsFetched: number;
  completionsFetched: number;
  dataGrouped: number;
  streaksCalculated: number;
  notificationsPrepared: number;
  notificationsInserted: number;
  end: number;
}) {
  const totalTime = (timing.end - timing.start).toFixed(2);

  // Build a single styled log message
  const logMessage = `
⏱️ Performance Timing Results ⏱️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ Total execution time: ${totalTime}ms
  ├─ Create client: ${(timing.clientCreated - timing.start).toFixed(2)}ms
  ├─ Fetch users: ${(timing.usersFetched - timing.clientCreated).toFixed(2)}ms
  ├─ Filter users: ${(timing.usersFiltered - timing.usersFetched).toFixed(2)}ms
  ├─ Fetch habits: ${(timing.habitsFetched - timing.usersFiltered).toFixed(2)}ms
  ├─ Fetch completions: ${(timing.completionsFetched - timing.habitsFetched).toFixed(2)}ms
  ├─ Group data: ${(timing.dataGrouped - timing.completionsFetched).toFixed(2)}ms
  ├─ Calculate streaks: ${(timing.streaksCalculated - timing.dataGrouped).toFixed(10)}ms${
    timing.notificationsPrepared > 0
      ? `\n  ├─ Prepare notifications: ${(timing.notificationsPrepared - timing.streaksCalculated).toFixed(2)}ms`
      : ''
  }${
    timing.notificationsInserted > 0
      ? `\n  └─ Insert notifications: ${(timing.notificationsInserted - timing.notificationsPrepared).toFixed(2)}ms`
      : '\n  └─ (No notifications inserted)'
  }
`;

  // Log everything in a single call
  console.log(logMessage);
}
