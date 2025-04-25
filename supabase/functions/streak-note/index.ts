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
} from './utils.ts';

// Configure dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TARGET_HOUR = 14; // 2 PM as specified in plan.md

Deno.serve(async (req) => {
  try {
    console.log('Starting streak-note function');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('Creating Supabase client');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // 1. Get all users with push tokens and their achievements
    console.log('Fetching users with achievements');
    const users = await getUsersWithAchievements(supabaseClient);
    console.log(
      `Found ${users.length} users with push tokens and achievements`
    );

    // 2. Filter users by target hour
    console.log('Filtering users by target hour');
    const usersInTargetHour = users.filter((user) =>
      isNextHourTarget(user.timezone, TARGET_HOUR)
    );
    console.log(`Found ${usersInTargetHour.length} users in target hour`);

    if (usersInTargetHour.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          notificationsScheduled: 0,
          usersInTargetHour: 0,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prepare notifications for eligible users
    console.log('Preparing notifications');
    const scheduledNotifications = prepareNotifications(
      usersInTargetHour,
      TARGET_HOUR
    );
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
