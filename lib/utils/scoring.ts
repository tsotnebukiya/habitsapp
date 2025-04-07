import { HabitCategory } from '../constants/HabitTemplates';
import { Database } from '@/lib/utils/supabase_types';
import { UserProfile } from '@/lib/interfaces/user_profile';
import dayjs from 'dayjs';

// Use types derived from Supabase schema
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

// --- Interfaces ---

// Represents the final displayed matrix score for all categories
export interface DisplayedMatrixScore {
  body: number;
  mind: number;
  heart: number;
  spirit: number;
  work: number;
  calculated_at: Date;
}

// --- Constants ---

const SMOOTHING_FACTOR = 0.1; // Alpha (α) for exponential smoothing
const LOOKBACK_WINDOW = 14; // Number of days (W) to consider for smoothing
const MIN_COMPLETIONS_THRESHOLD = 0; // Minimum completions needed in a category before regular scoring applies

// --- Helper Functions ---

/**
 * Gets the baseline score for a specific category from user profile.
 */
function getBaselineScore(
  category: HabitCategory,
  userProfile: UserProfile
): number {
  switch (category) {
    case 'body':
      return userProfile.bodyScore || 50;
    case 'mind':
      return userProfile.mindScore || 50;
    case 'heart':
      return userProfile.heartScore || 50;
    case 'spirit':
      return userProfile.spiritScore || 50;
    case 'work':
      return userProfile.workScore || 50;
    default:
      return 50;
  }
}

/**
 * Consistently formats a date to YYYY-MM-DD, handling both Date objects and date strings.
 * This ensures we only compare the date part without time components.
 */
function getDateString(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Filters habits to find those active on a specific date (YYYY-MM-DD).
 */
function getActiveHabitsForDay(habits: Habit[], date: string): Habit[] {
  // Get day of week using dayjs for consistency
  const dayOfWeek = dayjs(date).day(); // 0=Sun, 1=Mon, ... 6=Sat

  // Log for debugging the date being evaluated
  console.log(`Evaluating habits for date: ${date}, day of week: ${dayOfWeek}`);

  return habits.filter((habit) => {
    // CRITICAL FIX: Check if habit existed on this date using dayjs consistently
    const habitStartDateString = getDateString(habit.start_date);
    const habitEndDateString = habit.end_date
      ? getDateString(habit.end_date)
      : null;

    // Habit exists if: habitStartDate <= date <= habitEndDate (or habitEndDate is null)
    const existsOnDate =
      habitStartDateString <= date &&
      (!habitEndDateString || date <= habitEndDateString);

    // Log for specific habits on the problem date
    if (habit.name === 'Exercise' && date === '2025-04-07') {
      console.log(`Exercise habit check for ${date}:`);
      console.log(
        `- Start date: ${habit.start_date} → formatted: ${habitStartDateString}`
      );
      console.log(
        `- End date: ${habit.end_date} → formatted: ${habitEndDateString}`
      );
      console.log(`- Exists on date: ${existsOnDate}`);
    }

    if (!existsOnDate) return false;

    if (habit.frequency_type === 'daily') {
      return true;
    }
    if (habit.frequency_type === 'weekly') {
      return habit.days_of_week?.includes(dayOfWeek) ?? false;
    }
    return false;
  });
}

/**
 * Get habits and completions for a specific category
 */
function getCategoryData(
  category: HabitCategory,
  allHabits: Habit[],
  allCompletions: HabitCompletion[]
): {
  habits: Habit[];
  completions: HabitCompletion[];
  completionCount: number;
} {
  // Get habits for this category
  const categoryHabits = allHabits.filter((h) => h.category_name === category);

  // Get habit IDs for this category
  const categoryHabitIds = new Set(categoryHabits.map((h) => h.id));

  // Filter completions that belong to habits in this category
  const categoryCompletions = allCompletions.filter((c) =>
    categoryHabitIds.has(c.habit_id)
  );

  // Count completed habits in this category
  const completedCount = categoryCompletions.filter(
    (c) => c.status === 'completed'
  ).length;

  return {
    habits: categoryHabits,
    completions: categoryCompletions,
    completionCount: completedCount,
  };
}

/**
 * Checks if a habit was completed on a specific date
 */
function checkHabitCompletion(
  habit: Habit,
  date: string,
  completionsMap: Map<string, HabitCompletion>
): boolean {
  const key = `${habit.id}_${date}`;
  const completion = completionsMap.get(key);

  // Debug log for specific habits
  if (habit.name === 'Exercise' && date === '2025-04-07') {
    console.log(`Checking completion for Exercise on ${date}:`);
    console.log(`- Lookup key: ${key}`);
    console.log(`- Completion found: ${!!completion}`);
    console.log(`- Status: ${completion?.status}`);
  }

  return completion?.status === 'completed';
}

// --- Core Calculation Functions ---

/**
 * Calculates the Daily Performance Score (DPS) for a specific category on a given date.
 * Scores ONLY based on 'completed' status. Ignores 'skipped' habits.
 *
 * Returns:
 * - 100: Perfect completion (all active habits completed)
 * - 0-99: Partial completion (some active habits completed)
 * - -1: No active habits for this day/category (neutral - should not affect score)
 */
function calculateDPS(
  category: HabitCategory,
  date: string, // YYYY-MM-DD
  allHabits: Habit[],
  completionsMap: Map<string, HabitCompletion> // Map<habitId_completionDate, completionData>
): number {
  // Log the calculation for debugging
  if (category === 'body' && date === '2025-04-07') {
    console.log(`Calculating DPS for category ${category} on date ${date}`);
  }

  const activeHabits = getActiveHabitsForDay(allHabits, date).filter(
    (h) => h.category_name === category
  );

  // Debug active habits
  if (category === 'body' && date === '2025-04-07') {
    console.log(
      `Found ${activeHabits.length} active habits for ${category} on ${date}:`
    );
    activeHabits.forEach((h) => console.log(`- ${h.name} (${h.id})`));
  }

  // Filter out habits that were skipped on this date
  const relevantHabits = activeHabits.filter((habit) => {
    const completionKey = `${habit.id}_${date}`;
    const completion = completionsMap.get(completionKey);

    // Debug each habit's completion status
    if (category === 'body' && date === '2025-04-07') {
      console.log(
        `- Checking habit ${habit.name} (${
          habit.id
        }), completion found: ${!!completion}, status: ${completion?.status}`
      );
    }

    return completion?.status !== 'skipped';
  });

  if (relevantHabits.length === 0) {
    if (category === 'body' && date === '2025-04-07') {
      console.log(
        `No relevant habits for ${category} on ${date}, returning -1`
      );
    }
    return -1;
  }

  const pointsPerHabit = 100 / relevantHabits.length;
  let totalScoreEarned = 0;

  relevantHabits.forEach((habit) => {
    // Use our new helper function
    if (checkHabitCompletion(habit, date, completionsMap)) {
      totalScoreEarned += pointsPerHabit;

      if (category === 'body' && date === '2025-04-07') {
        console.log(
          `- Habit ${habit.name} completed, adding ${pointsPerHabit} points`
        );
      }
    }
  });

  // Cap the total score at 100 for the day
  const finalScore = Math.min(100, totalScoreEarned);

  if (category === 'body' && date === '2025-04-07') {
    console.log(`Final DPS for ${category} on ${date}: ${finalScore}`);
  }

  return finalScore;
}

/**
 * Calculates the final Displayed Matrix Score (DMS) using exponential smoothing.
 * Uses userProfile as the source of baseline scores.
 */
export function calculateDMS(
  userProfile: UserProfile,
  allHabits: Habit[],
  completionsHistory: HabitCompletion[] // Array of completions for the lookback window
): DisplayedMatrixScore {
  const today = new Date();
  const categories: HabitCategory[] = [
    'body',
    'mind',
    'heart',
    'spirit',
    'work',
  ];

  // Create a map for faster completion lookups using completion_date
  const completionsMap = new Map<string, HabitCompletion>();
  completionsHistory.forEach((comp) => {
    // CRITICAL FIX: Ensure consistent date format for lookup keys
    const dateString = getDateString(comp.completion_date);
    const key = `${comp.habit_id}_${dateString}`;
    completionsMap.set(key, comp);

    // Debug log key creation
    if (comp.habit_id === '9ad185fc-88b9-4de2-b39e-cc7854a6ad8a') {
      console.log(
        `Creating key for Exercise: ${key}, original date: ${comp.completion_date}`
      );
    }
  });

  console.log('Map keys:', Array.from(completionsMap.keys()));

  // Process each category independently
  const finalScores: Partial<DisplayedMatrixScore> = {};
  categories.forEach((category) => {
    // Get data specific to this category only
    const { completionCount } = getCategoryData(
      category,
      allHabits,
      completionsHistory
    );

    // Get baseline score for this category
    let smoothedScore = getBaselineScore(category, userProfile);

    // For categories with very few completions, maintain baseline score

    // Iterate through the lookback window (e.g., 14 days)
    for (let i = LOOKBACK_WINDOW - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - i);
      // CRITICAL FIX: Use our consistent date formatting helper
      const dateString = getDateString(date);

      const dps = calculateDPS(category, dateString, allHabits, completionsMap);

      // Only apply smoothing formula if there were active habits (dps >= 0)
      // If dps is -1, maintain the current score (no change for days without habits)
      if (dps >= 0) {
        const oldScore = smoothedScore;
        smoothedScore =
          SMOOTHING_FACTOR * dps + (1 - SMOOTHING_FACTOR) * smoothedScore;
      }
    }

    // Round to whole number
    finalScores[category] = Math.round(smoothedScore);
  });

  return {
    body: finalScores.body ?? 50,
    mind: finalScores.mind ?? 50,
    heart: finalScores.heart ?? 50,
    spirit: finalScores.spirit ?? 50,
    work: finalScores.work ?? 50,
    calculated_at: new Date(),
  };
}
