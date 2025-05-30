// Setup type definitions for built-in Supabase Runtime APIs
import dayjs from 'dayjs';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  getActiveHabitsWithReminders,
  getHabitCompletionsForDate,
  getUsersWithPushTokensForHabits,
} from '../_shared/queries.ts';
import {
  createErrorResponse,
  createSuccessResponse,
  createSupabaseClient,
  groupHabitsAndCompletions,
  setupDayjs,
} from '../_shared/utils.ts';
import { prepareNotifications } from './utils.ts';

// Configure dayjs with UTC and timezone plugins
setupDayjs();

Deno.serve(async (req) => {
  try {
    const supabaseClient = createSupabaseClient();

    // 1. Get all users with push tokens
    const users = await getUsersWithPushTokensForHabits(supabaseClient);

    if (users.length === 0) {
      return createSuccessResponse({
        success: true,
        notificationsScheduled: 0,
      });
    }

    // 2. Get habits for all users (with reminder_time filter)
    const today = dayjs().format('YYYY-MM-DD');
    const habits = await getActiveHabitsWithReminders(
      supabaseClient,
      users.map((u) => u.id),
      today
    );

    if (habits.length === 0) {
      return createSuccessResponse({
        success: true,
        notificationsScheduled: 0,
      });
    }

    // 3. Get completions for habits
    const completions = await getHabitCompletionsForDate(
      supabaseClient,
      habits.map((h) => h.id),
      today
    );

    // 4. Group all data together
    const usersWithData = groupHabitsAndCompletions(users, habits, completions);

    // 5. Prepare notifications
    const scheduledNotifications = prepareNotifications(usersWithData);

    // 6. Insert scheduled notifications into the database
    if (scheduledNotifications.length > 0) {
      const { error } = await supabaseClient
        .from('notifications')
        .insert(scheduledNotifications);

      if (error) {
        console.error('Error inserting notifications:', error);
        throw error;
      }
    }

    return createSuccessResponse({
      success: true,
      notificationsScheduled: scheduledNotifications.length,
    });
  } catch (error: unknown) {
    return createErrorResponse(error);
  }
});
