// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  getUsersWithPushTokens,
  getActiveHabits,
  getHabitCompletions,
  groupHabitsAndCompletions,
  prepareNotifications,
  isNextHourTarget,
} from './utils.ts';

// Configure dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const MORNING_HOUR = 8;
const EVENING_HOUR = 17; // 5 PM

Deno.serve(async (req) => {
  try {
    console.log('Starting daily-update-note function');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('Creating Supabase client');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // 1. Get all users with push tokens
    console.log('Fetching users with push tokens');
    const users = await getUsersWithPushTokens(supabaseClient);
    console.log(`Found ${users.length} users with push tokens`);

    // 2. Filter users based on their next hour
    console.log('Filtering users based on next hour');
    const usersInTargetHour = users.filter(
      (user) =>
        isNextHourTarget(user.timezone, MORNING_HOUR) ||
        isNextHourTarget(user.timezone, EVENING_HOUR)
    );
    console.log(`Found ${usersInTargetHour.length} users in target hour`);

    if (usersInTargetHour.length === 0) {
      return new Response(
        JSON.stringify({ success: true, notificationsScheduled: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Get habits for filtered users
    const today = dayjs().format('YYYY-MM-DD');
    console.log(`Fetching habits for date: ${today}`);
    const habits = await getActiveHabits(
      supabaseClient,
      usersInTargetHour.map((u) => u.id),
      today
    );
    console.log(`Found ${habits.length} active habits`);

    // 4. Get completions for habits
    console.log('Fetching habit completions');
    const completions =
      habits.length > 0
        ? await getHabitCompletions(
            supabaseClient,
            habits.map((h) => h.id),
            today
          )
        : [];
    console.log(`Found ${completions.length} habit completions`);

    // 5. Group all data together
    console.log('Grouping data');
    const usersWithData = groupHabitsAndCompletions(
      usersInTargetHour,
      habits,
      completions
    );

    // 6. Prepare notifications
    console.log('Preparing notifications');
    const scheduledNotifications = prepareNotifications(
      usersWithData,
      MORNING_HOUR,
      EVENING_HOUR
    );
    console.log(`Prepared ${scheduledNotifications.length} notifications`);

    // 7. Insert scheduled notifications into the database
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
    console.error('Error in daily-update-note function:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
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
