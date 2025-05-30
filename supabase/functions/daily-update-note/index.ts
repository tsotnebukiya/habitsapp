// Setup type definitions for built-in Supabase Runtime APIs
import dayjs from 'dayjs';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  getActiveHabitsForDate,
  getHabitCompletionsForDate,
  getUsersWithPushTokensForDailyUpdate,
} from '../_shared/queries.ts';
import {
  createErrorResponse,
  createSuccessResponse,
  createSupabaseClient,
  groupHabitsAndCompletions,
  isNextHourTargetAlt,
  setupDayjs,
} from '../_shared/utils.ts';
import { prepareNotifications } from './utils.ts';

// Configure dayjs with UTC and timezone plugins
setupDayjs();

const MORNING_HOUR = 8;
const EVENING_HOUR = 17; // 5 PM

Deno.serve(async (req) => {
  try {
    const supabaseClient = createSupabaseClient();

    // 1. Get all users with push tokens
    const users = await getUsersWithPushTokensForDailyUpdate(supabaseClient);

    // 2. Filter users based on their next hour
    const usersInTargetHour = users.filter(
      (user) =>
        isNextHourTargetAlt(user.timezone, MORNING_HOUR) ||
        isNextHourTargetAlt(user.timezone, EVENING_HOUR)
    );

    if (usersInTargetHour.length === 0) {
      return createSuccessResponse({
        success: true,
        notificationsScheduled: 0,
      });
    }

    // 3. Get habits for filtered users
    const today = dayjs().format('YYYY-MM-DD');
    const habits = await getActiveHabitsForDate(
      supabaseClient,
      usersInTargetHour.map((u) => u.id),
      today
    );

    // 4. Get completions for habits
    const completions =
      habits.length > 0
        ? await getHabitCompletionsForDate(
            supabaseClient,
            habits.map((h) => h.id),
            today
          )
        : [];

    // 5. Group all data together
    const usersWithData = groupHabitsAndCompletions(
      usersInTargetHour,
      habits,
      completions
    );

    // 6. Prepare notifications
    const scheduledNotifications = prepareNotifications(
      usersWithData,
      MORNING_HOUR,
      EVENING_HOUR
    );

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
    }

    return createSuccessResponse({
      success: true,
      notificationsScheduled: scheduledNotifications.length,
    });
  } catch (error: unknown) {
    return createErrorResponse(error);
  }
});
