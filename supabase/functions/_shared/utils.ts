// Shared utility functions for Supabase Edge Functions
import dayjs from 'dayjs';
import isBetween from 'https://esm.sh/dayjs@1.11.10/plugin/isBetween';
import timezone from 'https://esm.sh/dayjs@1.11.10/plugin/timezone';
import utc from 'https://esm.sh/dayjs@1.11.10/plugin/utc';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { BaseUser, Habit, HabitCompletion, UserWithHabits } from './types.ts';

// Setup dayjs plugins (used in multiple files)
export function setupDayjs(): void {
  dayjs.extend(timezone);
  dayjs.extend(utc);
  dayjs.extend(isBetween);
}

// Create Supabase client (identical pattern across all functions)
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Group habits and completions (identical in 3 files)
export function groupHabitsAndCompletions<T extends BaseUser>(
  users: T[],
  habits: Habit[],
  completions: HabitCompletion[]
): UserWithHabits<T>[] {
  // Create a Map for faster lookups
  const completionsByHabit = new Map<string, HabitCompletion[]>();
  for (const completion of completions) {
    if (!completionsByHabit.has(completion.habit_id)) {
      completionsByHabit.set(completion.habit_id, []);
    }
    completionsByHabit.get(completion.habit_id)!.push(completion);
  }

  const habitsByUser = new Map<
    string,
    (Habit & { completions: HabitCompletion[] })[]
  >();
  for (const habit of habits) {
    if (!habitsByUser.has(habit.user_id)) {
      habitsByUser.set(habit.user_id, []);
    }
    habitsByUser.get(habit.user_id)!.push({
      ...habit,
      completions: completionsByHabit.get(habit.id) || [],
    });
  }

  return users.map((user) => ({
    ...user,
    habits: habitsByUser.get(user.id) || [],
  }));
}

// Alternative version from daily-update-note/habits-note
export function isNextHourTargetAlt(
  userTimezone: string,
  targetHour: number
): boolean {
  const nextHour = dayjs()
    .tz(userTimezone || 'UTC')
    .add(1, 'hour')
    .hour();
  return nextHour === targetHour;
}

// Standard success response
export function createSuccessResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Standard error response (pattern from all functions)
export function createErrorResponse(error: unknown, status = 500): Response {
  console.error('Error:', error);

  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error occurred';
  const errorDetails = error instanceof Error ? error.stack : undefined;

  return new Response(
    JSON.stringify({
      success: false,
      error: errorMessage,
      errorDetails,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// CORS headers (from email-resend and delete-user)
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// CORS preflight response
export function createCorsResponse(): Response {
  return new Response('ok', { headers: CORS_HEADERS });
}

// Translation utilities
import {
  LanguageTranslations,
  Template,
  translations,
} from './translations.ts';

// Simple type-safe translation access
export function getTemplates(
  language: string,
  section: 'streak' | 'habits' | 'dailyUpdate',
  subsection?: string
): Template[] {
  // Get language with fallback to English
  const lang: LanguageTranslations =
    translations[language] || translations['en'];

  if (section === 'streak' && subsection) {
    if (subsection === 'twoDay') return lang.streak.twoDay.templates;
    if (subsection === 'oneDay') return lang.streak.oneDay.templates;
    // Fallback to twoDay if subsection not recognized
    return lang.streak.twoDay.templates;
  }

  if (section === 'streak') {
    // Default to twoDay for backward compatibility
    return lang.streak.twoDay.templates;
  }

  if (section === 'habits') {
    return lang.habits.templates;
  }

  if (section === 'dailyUpdate' && subsection) {
    const [period, category] = subsection.split('.');

    if (period === 'morning') {
      if (category === 'noHabits') return lang.dailyUpdate.morning.noHabits;
      if (category === 'hasHabits') return lang.dailyUpdate.morning.hasHabits;
    }

    if (period === 'evening') {
      if (category === 'complete') return lang.dailyUpdate.evening.complete;
      if (category === 'mediumProgress')
        return lang.dailyUpdate.evening.mediumProgress;
      if (category === 'lowProgress')
        return lang.dailyUpdate.evening.lowProgress;
      if (category === 'noProgress') return lang.dailyUpdate.evening.noProgress;
    }
  }

  // Fallback to English for any unmatched paths
  const fallback = translations['en'];
  return fallback.dailyUpdate.morning.noHabits;
}

// Type-safe random template selection
export function selectRandomTemplate(templates: Template[]): Template {
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}
