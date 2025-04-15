import { HabitCategory, CATEGORY_IDS } from '../constants/HabitTemplates';
import { Database } from '@/lib/utils/supabase_types';
import { UserProfile } from '@/lib/stores/user_profile';
import { dateUtils } from './dayjs';

// Use types derived from Supabase schema
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

export interface DisplayedMatrixScore {
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;
  calculated_at: Date;
}

const SMOOTHING_FACTOR = 0.02; // Alpha (α) for exponential smoothing
const LOOKBACK_WINDOW = 14; // Number of days to consider for smoothing

// Pre-calculate baseline scores for faster lookup
const BASELINE_SCORES: Record<HabitCategory, number> = {
  cat1: 50,
  cat2: 50,
  cat3: 50,
  cat4: 50,
  cat5: 50,
};

function getBaselineScore(
  category: HabitCategory,
  userProfile: UserProfile
): number {
  switch (category) {
    case 'cat1':
      return userProfile.cat1 ?? BASELINE_SCORES.cat1;
    case 'cat2':
      return userProfile.cat2 ?? BASELINE_SCORES.cat2;
    case 'cat3':
      return userProfile.cat3 ?? BASELINE_SCORES.cat3;
    case 'cat4':
      return userProfile.cat4 ?? BASELINE_SCORES.cat4;
    case 'cat5':
      return userProfile.cat5 ?? BASELINE_SCORES.cat5;
    default:
      return BASELINE_SCORES.cat1;
  }
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
    cat1: Math.round(categoryScores[CATEGORY_IDS.indexOf('cat1')]),
    cat2: Math.round(categoryScores[CATEGORY_IDS.indexOf('cat2')]),
    cat3: Math.round(categoryScores[CATEGORY_IDS.indexOf('cat3')]),
    cat4: Math.round(categoryScores[CATEGORY_IDS.indexOf('cat4')]),
    cat5: Math.round(categoryScores[CATEGORY_IDS.indexOf('cat5')]),
    calculated_at: dateUtils.now().toDate(),
  };

  return result;
}
