// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  getActiveHabitsBasic,
  getHabitCompletionsAll,
  getUsersWithAchievements,
} from '../_shared/queries.ts';
import type { UserWithCurrentStreak } from '../_shared/types.ts';
import {
  createErrorResponse,
  createSuccessResponse,
  createSupabaseClient,
  groupHabitsAndCompletions,
  isNextHourTargetAlt,
  setupDayjs,
} from '../_shared/utils.ts';
import { calculateUserStreaks, prepareNotifications } from './utils.ts';

setupDayjs();

const TARGET_HOUR = 7;

Deno.serve(async (req) => {
  try {
    const supabaseClient = createSupabaseClient();

    // 1. Get all users with push tokens and their achievements
    const users = await getUsersWithAchievements(supabaseClient);

    // 2. Filter users by target hour

    const usersInTargetHour = users.filter((user) =>
      isNextHourTargetAlt(user.timezone, TARGET_HOUR)
    );

    // 3. Get Habits for users
    const habits = await getActiveHabitsBasic(
      supabaseClient,
      usersInTargetHour.map((u) => u.id)
    );
    // 4. Get completions for habits
    const completions = await getHabitCompletionsAll(
      supabaseClient,
      habits.map((h) => h.id)
    );

    // 5. Group habits and completions
    const usersWithHabits = groupHabitsAndCompletions(
      usersInTargetHour,
      habits,
      completions
    );
    // 6. Calculate streaks
    const streakResults = calculateUserStreaks(usersWithHabits);

    if (usersInTargetHour.length === 0) {
      return createSuccessResponse({
        success: true,
        notificationsScheduled: 0,
        usersInTargetHour: 0,
      });
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
          preferred_language: user.preferred_language,
          streak_achievements: user.streak_achievements,
          current_streak: result.currentStreak,
        };
      })
      .filter((user): user is UserWithCurrentStreak => user !== null); // Type predicate

    const scheduledNotifications = prepareNotifications(
      usersWithCurrentStreak,
      TARGET_HOUR
    );

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

    return createSuccessResponse({
      success: true,
      notificationsScheduled: scheduledNotifications.length,
    });
  } catch (error: unknown) {
    console.error('Error in streak-note function:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }

    return createErrorResponse(error);
  }
});
