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
  isNextHourTarget,
  setupDayjs,
} from '../_shared/utils.ts';
import { calculateUserStreaks, prepareNotifications } from './utils.ts';

// Configure dayjs with UTC and timezone plugins
setupDayjs();

// const TARGET_HOUR = 14; // 2 PM as specified in plan.md
const TARGET_HOUR = 5; // 2 PM as specified in plan.md

Deno.serve(async (req) => {
  try {
    const supabaseClient = createSupabaseClient();

    // 1. Get all users with push tokens and their achievements
    const users = await getUsersWithAchievements(supabaseClient);

    // 2. Filter users by target hour

    const usersInTargetHour = users.filter((user) =>
      isNextHourTarget(user.timezone, TARGET_HOUR)
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
    console.log(
      usersInTargetHour,
      habits,
      completions,
      usersWithHabits,
      streakResults
    );

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

// [
//   {
//     id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     push_token: "ExponentPushToken[-LDSbqNpwulf_r8aXYQDsU]",
//     timezone: "Asia/Tbilisi",
//     preferred_language: "ru",
//     streak_achievements: {
//       "1": true,
//       "3": false,
//       "5": false,
//       "7": false,
//       "10": false,
//       "14": false,
//       "21": false,
//       "28": false,
//       "30": false,
//       "45": false,
//       "60": false,
//       "90": false,
//       "100": false,
//       "180": false,
//       "200": false
//     }
//   }
// ] [
//   {
//     id: "ced6794c-d3cd-4ad4-a57f-8ffba34be485",
//     user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     created_at: "2025-05-29T16:26:48.481+00:00",
//     updated_at: "2025-05-29T16:26:48.481+00:00",
//     name: "Random Act of Kindness",
//     description: "Perform a random act of kindness.",
//     icon: "hands.sparkles.fill",
//     color: "#FF8A65",
//     frequency_type: "daily",
//     completions_per_day: 1,
//     days_of_week: null,
//     start_date: "2025-05-29",
//     end_date: null,
//     goal_value: 1,
//     goal_unit: "count",
//     streak_goal: null,
//     reminder_time: null,
//     category_name: "cat3",
//     gamification_attributes: null,
//     is_active: true,
//     type: "GOOD",
//     sort_id: 1
//   },
//   {
//     id: "1fe3a6c8-59da-48de-89fd-76c9b3e63c51",
//     user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     created_at: "2025-05-29T23:58:27.748+00:00",
//     updated_at: "2025-05-29T23:58:27.748+00:00",
//     name: "Language Practice",
//     description: "Practice a foreign language for 15 minutes.",
//     icon: "globe.europe.africa.fill",
//     color: "#5C6BC0",
//     frequency_type: "daily",
//     completions_per_day: 15,
//     days_of_week: null,
//     start_date: "2025-05-30",
//     end_date: null,
//     goal_value: 15,
//     goal_unit: "minutes",
//     streak_goal: null,
//     reminder_time: "04:00:00",
//     category_name: "cat2",
//     gamification_attributes: null,
//     is_active: true,
//     type: "GOOD",
//     sort_id: 2
//   },
//   {
//     id: "5c515085-73b6-4933-8b4f-68e3bc842997",
//     user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     created_at: "2025-05-30T00:35:44.121+00:00",
//     updated_at: "2025-05-30T00:35:44.121+00:00",
//     name: "Drink Water",
//     description: "Drink at least 8 glasses of water.",
//     icon: "drop.fill",
//     color: "#59B0F6",
//     frequency_type: "daily",
//     completions_per_day: 8,
//     days_of_week: null,
//     start_date: "2025-05-30",
//     end_date: null,
//     goal_value: 8,
//     goal_unit: "glasses",
//     streak_goal: null,
//     reminder_time: "04:40:00",
//     category_name: "cat1",
//     gamification_attributes: null,
//     is_active: true,
//     type: "GOOD",
//     sort_id: 3
//   },
//   {
//     id: "23a63dba-a194-46b9-81e7-fd1d69f66b02",
//     user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     created_at: "2025-05-30T00:36:17.299+00:00",
//     updated_at: "2025-05-30T00:36:17.299+00:00",
//     name: "Reading",
//     description: "Read for 30 minutes.",
//     icon: "book.closed.fill",
//     color: "#7E57C2",
//     frequency_type: "daily",
//     completions_per_day: 30,
//     days_of_week: null,
//     start_date: "2025-05-30",
//     end_date: null,
//     goal_value: 30,
//     goal_unit: "minutes",
//     streak_goal: null,
//     reminder_time: "05:36:00",
//     category_name: "cat2",
//     gamification_attributes: null,
//     is_active: true,
//     type: "GOOD",
//     sort_id: 4
//   }
// ] [
//   {
//     id: "9188b31c-3713-40f1-9400-da25cf1947df",
//     habit_id: "ced6794c-d3cd-4ad4-a57f-8ffba34be485",
//     user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     completion_date: "2025-05-29",
//     status: "completed",
//     value: 1,
//     created_at: "2025-05-29T16:26:53.461+00:00"
//   }
// ] [
//   {
//     id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//     push_token: "ExponentPushToken[-LDSbqNpwulf_r8aXYQDsU]",
//     timezone: "Asia/Tbilisi",
//     preferred_language: "ru",
//     streak_achievements: {
//       "1": true,
//       "3": false,
//       "5": false,
//       "7": false,
//       "10": false,
//       "14": false,
//       "21": false,
//       "28": false,
//       "30": false,
//       "45": false,
//       "60": false,
//       "90": false,
//       "100": false,
//       "180": false,
//       "200": false
//     },
//     habits: [
//       {
//         id: "ced6794c-d3cd-4ad4-a57f-8ffba34be485",
//         user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//         created_at: "2025-05-29T16:26:48.481+00:00",
//         updated_at: "2025-05-29T16:26:48.481+00:00",
//         name: "Random Act of Kindness",
//         description: "Perform a random act of kindness.",
//         icon: "hands.sparkles.fill",
//         color: "#FF8A65",
//         frequency_type: "daily",
//         completions_per_day: 1,
//         days_of_week: null,
//         start_date: "2025-05-29",
//         end_date: null,
//         goal_value: 1,
//         goal_unit: "count",
//         streak_goal: null,
//         reminder_time: null,
//         category_name: "cat3",
//         gamification_attributes: null,
//         is_active: true,
//         type: "GOOD",
//         sort_id: 1,
//         completions: [ [Object] ]
//       },
//       {
//         id: "1fe3a6c8-59da-48de-89fd-76c9b3e63c51",
//         user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//         created_at: "2025-05-29T23:58:27.748+00:00",
//         updated_at: "2025-05-29T23:58:27.748+00:00",
//         name: "Language Practice",
//         description: "Practice a foreign language for 15 minutes.",
//         icon: "globe.europe.africa.fill",
//         color: "#5C6BC0",
//         frequency_type: "daily",
//         completions_per_day: 15,
//         days_of_week: null,
//         start_date: "2025-05-30",
//         end_date: null,
//         goal_value: 15,
//         goal_unit: "minutes",
//         streak_goal: null,
//         reminder_time: "04:00:00",
//         category_name: "cat2",
//         gamification_attributes: null,
//         is_active: true,
//         type: "GOOD",
//         sort_id: 2,
//         completions: []
//       },
//       {
//         id: "5c515085-73b6-4933-8b4f-68e3bc842997",
//         user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//         created_at: "2025-05-30T00:35:44.121+00:00",
//         updated_at: "2025-05-30T00:35:44.121+00:00",
//         name: "Drink Water",
//         description: "Drink at least 8 glasses of water.",
//         icon: "drop.fill",
//         color: "#59B0F6",
//         frequency_type: "daily",
//         completions_per_day: 8,
//         days_of_week: null,
//         start_date: "2025-05-30",
//         end_date: null,
//         goal_value: 8,
//         goal_unit: "glasses",
//         streak_goal: null,
//         reminder_time: "04:40:00",
//         category_name: "cat1",
//         gamification_attributes: null,
//         is_active: true,
//         type: "GOOD",
//         sort_id: 3,
//         completions: []
//       },
//       {
//         id: "23a63dba-a194-46b9-81e7-fd1d69f66b02",
//         user_id: "2a91da72-776e-415f-8e81-65e17d9ae154",
//         created_at: "2025-05-30T00:36:17.299+00:00",
//         updated_at: "2025-05-30T00:36:17.299+00:00",
//         name: "Reading",
//         description: "Read for 30 minutes.",
//         icon: "book.closed.fill",
//         color: "#7E57C2",
//         frequency_type: "daily",
//         completions_per_day: 30,
//         days_of_week: null,
//         start_date: "2025-05-30",
//         end_date: null,
//         goal_value: 30,
//         goal_unit: "minutes",
//         streak_goal: null,
//         reminder_time: "05:36:00",
//         category_name: "cat2",
//         gamification_attributes: null,
//         is_active: true,
//         type: "GOOD",
//         sort_id: 4,
//         completions: []
//       }
//     ]
//   }
// ] [
//   { userId: "2a91da72-776e-415f-8e81-65e17d9ae154", currentStreak: 0 }
// ]
