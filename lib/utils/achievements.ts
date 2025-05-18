import { CATEGORY_IDS, HabitCategory } from '@/lib/constants/HabitTemplates';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import {
  DisplayedMatrixScore,
  Habit,
  HabitCompletion,
  StreakDays,
} from '@/lib/habit-store/types';
import { UserProfile } from '@/lib/stores/user_profile';
import { dateUtils } from '@/lib/utils/dayjs';

const SMOOTHING_FACTOR = 0.015; // Alpha (α) for exponential smoothing
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
  // Pre-calculate dates once using UTC
  const today = dateUtils.todayUTC();
  const lookbackDates = new Array(LOOKBACK_WINDOW);
  const dateStrings = new Array(LOOKBACK_WINDOW);

  for (let i = 0; i < LOOKBACK_WINDOW; i++) {
    const date = dateUtils.subtractDays(today, i).toDate();
    lookbackDates[i] = date;
    dateStrings[i] = dateUtils.toServerDateString(date);
  }

  // Create completion lookup table
  const completionLookup: Record<
    string,
    { isSkipped: boolean; isCompleted: boolean }
  > = {};
  completions.forEach((completion) => {
    const key = `${completion.habit_id}_${dateUtils.toServerDateString(
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

export type StreakAchievements = {
  [K in StreakDays]?: boolean;
};

/**
 * Calculate the current streak based on daily habit completions
 * A day is considered complete if ALL active habits for that day are completed
 */
export function calculateCurrentStreak(
  completions: Map<string, HabitCompletion>,
  habits: Map<string, Habit>
): number {
  // Early return for empty cases
  if (completions.size === 0 || habits.size === 0) return 0;

  // Pre-process: Normalize dates and create lookup structures
  const today = dateUtils.normalize(dateUtils.today());

  // Create a map of normalized dates to completions
  const completionsByDate = new Map<string, Set<string>>();
  const normalizedDates = new Set<string>();

  completions.forEach((completion) => {
    const normalizedDate = dateUtils
      .normalize(completion.completion_date)
      .format('YYYY-MM-DD');
    normalizedDates.add(normalizedDate);

    if (!completionsByDate.has(normalizedDate)) {
      completionsByDate.set(normalizedDate, new Set());
    }

    // Store only completed/skipped habits
    if (completion.status === 'completed' || completion.status === 'skipped') {
      completionsByDate.get(normalizedDate)!.add(completion.habit_id);
    }
  });

  // Pre-calculate habit activity periods
  type HabitPeriod = { id: string; start: string; end: string | null };
  const habitPeriods: HabitPeriod[] = Array.from(habits.values()).map(
    (habit) => ({
      id: habit.id,
      start: dateUtils.normalize(habit.created_at).format('YYYY-MM-DD'),
      end: habit.end_date
        ? dateUtils.normalize(habit.end_date).format('YYYY-MM-DD')
        : null,
    })
  );

  // Sort dates once, in descending order
  const sortedDates = Array.from(normalizedDates).sort((a, b) =>
    b.localeCompare(a)
  );

  let currentStreak = 0;
  let previousDate = today.format('YYYY-MM-DD');

  // Calculate streak
  for (const date of sortedDates) {
    // Break streak if there's a gap
    const daysDiff = dateUtils
      .normalize(previousDate)
      .diff(dateUtils.normalize(date), 'day');

    if (daysDiff > 1) break;

    // Get active habits for this date
    const activeHabits = habitPeriods.filter(({ start, end }) => {
      const isAfterStart = date >= start;
      const isBeforeEnd = !end || date <= end;
      return isAfterStart && isBeforeEnd;
    });

    // Skip dates with no active habits
    if (activeHabits.length === 0) {
      previousDate = date;
      continue;
    }

    // Get completed habits for this date
    const completedHabits = completionsByDate.get(date) || new Set();

    // Check if all active habits are completed
    const allCompleted = activeHabits.every((habit) =>
      completedHabits.has(habit.id)
    );

    if (!allCompleted) break;

    currentStreak++;
    previousDate = date;
  }

  return currentStreak;
}

/**
 * Determine which achievements should be unlocked based on the current streak
 */
export function calculateNewAchievements(
  currentStreak: number,
  currentAchievements: StreakAchievements
): StreakAchievements {
  // Start with current achievements
  const newAchievements = { ...currentAchievements };

  // Check each achievement threshold
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    // Only update if achievement is not already unlocked
    if (!currentAchievements[achievement.id]) {
      newAchievements[achievement.id] = currentStreak >= achievement.days;
    }
  });

  return newAchievements;
}

/**
 * Determine which achievements should be removed when streak is broken
 */
export function calculateAchievementsToRemove(
  currentStreak: number,
  currentAchievements: StreakAchievements
): StreakAchievements {
  const updatedAchievements = { ...currentAchievements };

  // Remove achievements that require longer streaks than current
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (currentStreak < achievement.days) {
      updatedAchievements[achievement.id] = false;
    }
  });

  return updatedAchievements;
}

/**
 * Get a list of newly unlocked achievements
 */
export function getNewlyUnlockedAchievements(
  oldAchievements: StreakAchievements,
  newAchievements: StreakAchievements
): StreakDays[] {
  return Object.entries(newAchievements)
    .filter(([key, value]) => {
      const days = Number(key) as StreakDays;
      // Return only achievements that are newly set to true
      return value === true && !oldAchievements[days];
    })
    .map(([key]) => Number(key) as StreakDays);
}

/**
 * Get achievement details for display
 */
export function getAchievementDetails(achievementId: StreakDays) {
  return ACHIEVEMENTS[achievementId];
}
