import { HabitCategory } from '../constants/HabitTemplates';
import { Database } from '@/lib/utils/supabase_types';
import { UserProfile } from '@/lib/interfaces/user_profile';

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

const SMOOTHING_FACTOR = 0.2; // Alpha (α) for exponential smoothing
const LOOKBACK_WINDOW = 14; // Number of days (W) to consider for smoothing

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
 * Filters habits to find those active on a specific date (YYYY-MM-DD).
 */
function getActiveHabitsForDay(habits: Habit[], date: string): Habit[] {
  const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay(); // 0=Sun, 1=Mon, ... 6=Sat
  return habits.filter((habit) => {
    // TODO: Add logic to check habit.start_date and habit.end_date if implemented
    const isActiveDateRange = true; // Placeholder
    if (!isActiveDateRange) return false;

    if (habit.frequency_type === 'daily') {
      return true;
    }
    if (habit.frequency_type === 'weekly') {
      return habit.days_of_week?.includes(dayOfWeek) ?? false;
    }
    return false;
  });
}

// --- Core Calculation Functions ---

/**
 * Calculates the Daily Performance Score (DPS) for a specific category on a given date.
 * Scores ONLY based on 'completed' status. Ignores 'skipped' habits.
 */
function calculateDPS(
  category: HabitCategory,
  date: string, // YYYY-MM-DD
  allHabits: Habit[],
  completionsMap: Map<string, HabitCompletion> // Map<habitId_completionDate, completionData>
): number {
  const activeHabits = getActiveHabitsForDay(allHabits, date).filter(
    (h) => h.category_name === category
  );

  // Filter out habits that were skipped on this date
  const relevantHabits = activeHabits.filter((habit) => {
    const completionKey = `${habit.id}_${date}`;
    const completion = completionsMap.get(completionKey);
    return completion?.status !== 'skipped';
  });

  // If no relevant (non-skipped) habits are active, DPS is 0 for the day
  if (relevantHabits.length === 0) {
    return 0;
  }

  // Calculate points based only on relevant (non-skipped) habits
  const pointsPerHabit = 100 / relevantHabits.length;
  let totalScoreEarned = 0;

  relevantHabits.forEach((habit) => {
    const completionKey = `${habit.id}_${date}`;
    const completion = completionsMap.get(completionKey);

    // Score is pointsPerHabit if the status is 'completed', otherwise 0
    if (completion?.status === 'completed') {
      totalScoreEarned += pointsPerHabit;
    }
  });

  // Cap the total score at 100 for the day
  return Math.min(100, totalScoreEarned);
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
  const finalScores: Partial<DisplayedMatrixScore> = {};

  // Create a map for faster completion lookups using completion_date
  const completionsMap = new Map<string, HabitCompletion>();
  completionsHistory.forEach((comp) => {
    // Use completion_date from Supabase type
    const key = `${comp.habit_id}_${comp.completion_date}`;
    completionsMap.set(key, comp);
  });

  categories.forEach((category) => {
    let smoothedScore = getBaselineScore(category, userProfile);

    // Iterate through the lookback window (e.g., 14 days)
    for (let i = LOOKBACK_WINDOW - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - i);
      const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

      const dps = calculateDPS(category, dateString, allHabits, completionsMap);

      smoothedScore =
        SMOOTHING_FACTOR * dps + (1 - SMOOTHING_FACTOR) * smoothedScore;
    }
    // Round to 1 decimal place
    finalScores[category] = Math.round(smoothedScore * 10) / 10;
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
