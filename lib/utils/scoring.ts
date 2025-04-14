import { HabitCategory, CATEGORY_IDS } from '../constants/HabitTemplates';
import { Database } from '@/lib/utils/supabase_types';
import { UserProfile } from '@/lib/stores/user_profile';
import { dateUtils } from './dayjs';

// Use types derived from Supabase schema
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

export interface DisplayedMatrixScore {
  body: number;
  mind: number;
  heart: number;
  spirit: number;
  work: number;
  calculated_at: Date;
}

const SMOOTHING_FACTOR = 0.02; // Alpha (α) for exponential smoothing
const LOOKBACK_WINDOW = 14; // Number of days to consider for smoothing

// Pre-calculate baseline scores for faster lookup
const BASELINE_SCORES: Record<HabitCategory, number> = {
  body: 50,
  mind: 50,
  heart: 50,
  spirit: 50,
  work: 50,
};

function getBaselineScore(
  category: HabitCategory,
  userProfile: UserProfile
): number {
  switch (category) {
    case 'body':
      return userProfile.bodyScore || BASELINE_SCORES.body;
    case 'mind':
      return userProfile.mindScore || BASELINE_SCORES.mind;
    case 'heart':
      return userProfile.heartScore || BASELINE_SCORES.heart;
    case 'spirit':
      return userProfile.spiritScore || BASELINE_SCORES.spirit;
    case 'work':
      return userProfile.workScore || BASELINE_SCORES.work;
    default:
      return BASELINE_SCORES.body;
  }
}

function getDateString(date: Date | string): string {
  return dateUtils.toDateString(date);
}

function getActiveHabitsForDay(habits: Habit[], date: string): Habit[] {
  const start = Date.now();
  const targetDate = dateUtils.normalize(date);
  const dayOfWeek = dateUtils.getDayOfWeek(targetDate);

  const result = habits.filter((habit) => {
    const habitStartDate = dateUtils.normalize(habit.start_date);
    const habitEndDate = habit.end_date
      ? dateUtils.normalize(habit.end_date)
      : null;

    const existsOnDate =
      dateUtils.isSameDay(habitStartDate, targetDate) ||
      (dateUtils.isBeforeDay(habitStartDate, targetDate) &&
        (!habitEndDate ||
          dateUtils.isSameDay(habitEndDate, targetDate) ||
          dateUtils.isAfterDay(habitEndDate, targetDate)));

    if (!existsOnDate) return false;

    if (habit.frequency_type === 'daily') {
      return true;
    }
    if (habit.frequency_type === 'weekly') {
      return habit.days_of_week?.includes(dayOfWeek) ?? false;
    }
    return false;
  });

  return result;
}

function getCategoryData(
  category: HabitCategory,
  allHabits: Habit[],
  allCompletions: HabitCompletion[]
): {
  habits: Habit[];
  completions: HabitCompletion[];
  completionCount: number;
} {
  const categoryHabits = allHabits.filter((h) => h.category_name === category);
  const categoryHabitIds = new Set(categoryHabits.map((h) => h.id));
  const categoryCompletions = allCompletions.filter((c) =>
    categoryHabitIds.has(c.habit_id)
  );
  const completedCount = categoryCompletions.filter(
    (c) => c.status === 'completed'
  ).length;

  return {
    habits: categoryHabits,
    completions: categoryCompletions,
    completionCount: completedCount,
  };
}

function checkHabitCompletion(
  habit: Habit,
  date: string,
  completionsMap: Map<string, HabitCompletion>
): boolean {
  const key = `${habit.id}_${date}`;
  const completion = completionsMap.get(key);
  return completion?.status === 'completed';
}

function calculateDPS(
  category: HabitCategory,
  date: string,
  allHabits: Habit[],
  completionsMap: Map<string, HabitCompletion>
): number {
  const start = Date.now();

  // Get active habits
  const filterStart = Date.now();
  const activeHabits = getActiveHabitsForDay(allHabits, date).filter(
    (h) => h.category_name === category
  );

  const relevantHabits = activeHabits.filter((habit) => {
    const completionKey = `${habit.id}_${date}`;
    const completion = completionsMap.get(completionKey);
    return completion?.status !== 'skipped';
  });

  if (relevantHabits.length === 0) {
    return -1;
  }

  const pointsPerHabit = 100 / relevantHabits.length;
  let totalScoreEarned = 0;

  // Calculate points
  const scoringStart = Date.now();
  relevantHabits.forEach((habit) => {
    if (checkHabitCompletion(habit, date, completionsMap)) {
      totalScoreEarned += pointsPerHabit;
    }
  });

  const result = Math.min(100, totalScoreEarned);

  return result;
}

// Optimized data structures
interface ProcessedHabit {
  id: string;
  category: HabitCategory;
  activeDates: boolean[]; // Array of LOOKBACK_WINDOW length indicating active days
  isSkipped: boolean; // Flag for skipped habits
  isCompleted: boolean; // Flag for completed habits
}

interface ProcessedData {
  habits: ProcessedHabit[];
  dateStrings: string[]; // Cache of date strings
  lookbackDates: Date[]; // Cache of Date objects
}

// Pre-process data with optimized data structures
function preprocessData(
  habits: Habit[],
  completions: HabitCompletion[]
): ProcessedData {
  // Pre-calculate dates once
  const today = dateUtils.today();
  const lookbackDates = new Array(LOOKBACK_WINDOW);
  const dateStrings = new Array(LOOKBACK_WINDOW);

  for (let i = 0; i < LOOKBACK_WINDOW; i++) {
    const date = dateUtils.subtractDays(today, i).toDate();
    lookbackDates[i] = date;
    dateStrings[i] = dateUtils.toDateString(date);
  }

  // Create completion lookup table
  const completionLookup: Record<
    string,
    { isSkipped: boolean; isCompleted: boolean }
  > = {};
  completions.forEach((completion) => {
    const key = `${completion.habit_id}_${dateUtils.toDateString(
      completion.completion_date
    )}`;
    completionLookup[key] = {
      isSkipped: completion.status === 'skipped',
      isCompleted: completion.status === 'completed',
    };
  });

  // Process habits
  const processedHabits = habits
    .filter((habit): habit is Habit & { category_name: HabitCategory } =>
      CATEGORY_IDS.includes(habit.category_name as HabitCategory)
    )
    .map((habit) => {
      const activeDates = new Array(LOOKBACK_WINDOW).fill(false);
      const habitStartDate = dateUtils.normalize(habit.start_date);
      const habitEndDate = habit.end_date
        ? dateUtils.normalize(habit.end_date)
        : null;

      // Calculate active days
      for (let i = 0; i < LOOKBACK_WINDOW; i++) {
        const targetDate = lookbackDates[i];
        const isActive =
          !dateUtils.isBeforeDay(targetDate, habitStartDate) &&
          (!habitEndDate || !dateUtils.isAfterDay(targetDate, habitEndDate)) &&
          (habit.frequency_type === 'daily' ||
            (habit.frequency_type === 'weekly' &&
              habit.days_of_week?.includes(
                dateUtils.getDayOfWeek(targetDate)
              )));

        activeDates[i] = isActive;
      }

      const completionKey = `${habit.id}_${dateStrings[0]}`; // Check most recent day
      const completion = completionLookup[completionKey] || {
        isSkipped: false,
        isCompleted: false,
      };

      return {
        id: habit.id,
        category: habit.category_name,
        activeDates,
        isSkipped: completion.isSkipped,
        isCompleted: completion.isCompleted,
      };
    });

  return {
    habits: processedHabits,
    dateStrings,
    lookbackDates,
  };
}

// Optimized DPS calculation using pre-processed data
function calculateOptimizedDPS(
  habits: ProcessedHabit[],
  dayIndex: number
): number {
  const activeHabits = habits.filter(
    (h) => h.activeDates[dayIndex] && !h.isSkipped
  );

  if (activeHabits.length === 0) {
    return -1;
  }

  const pointsPerHabit = 100 / activeHabits.length;
  const totalScore = activeHabits.reduce(
    (score, habit) => (habit.isCompleted ? score + pointsPerHabit : score),
    0
  );

  return Math.min(100, totalScore);
}

export function calculateDMS(
  userProfile: UserProfile,
  allHabits: Habit[],
  completionsHistory: HabitCompletion[]
): DisplayedMatrixScore {
  const processedData = preprocessData(allHabits, completionsHistory);

  // Pre-allocate score arrays for vectorized calculations
  const categoryScores = new Float32Array(CATEGORY_IDS.length);
  const baselineScores = new Float32Array(CATEGORY_IDS.length);

  // Initialize baseline scores
  CATEGORY_IDS.forEach((category, index) => {
    baselineScores[index] = getBaselineScore(category, userProfile);
    categoryScores[index] = baselineScores[index];
  });

  // Calculate scores for each day
  for (let dayIndex = LOOKBACK_WINDOW - 1; dayIndex >= 0; dayIndex--) {
    CATEGORY_IDS.forEach((category, categoryIndex) => {
      const categoryHabits = processedData.habits.filter(
        (h) => h.category === category
      );
      const dps = calculateOptimizedDPS(categoryHabits, dayIndex);

      if (dps >= 0) {
        // Vectorized smoothing calculation
        categoryScores[categoryIndex] =
          SMOOTHING_FACTOR * dps +
          (1 - SMOOTHING_FACTOR) * categoryScores[categoryIndex];
      }
    });
  }

  const result: DisplayedMatrixScore = {
    body: Math.round(categoryScores[CATEGORY_IDS.indexOf('body')]),
    mind: Math.round(categoryScores[CATEGORY_IDS.indexOf('mind')]),
    heart: Math.round(categoryScores[CATEGORY_IDS.indexOf('heart')]),
    spirit: Math.round(categoryScores[CATEGORY_IDS.indexOf('spirit')]),
    work: Math.round(categoryScores[CATEGORY_IDS.indexOf('work')]),
    calculated_at: dateUtils.now().toDate(),
  };

  return result;
}
