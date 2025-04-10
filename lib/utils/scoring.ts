import { HabitCategory, CATEGORY_IDS } from '../constants/HabitTemplates';
import { Database } from '@/lib/utils/supabase_types';
import { UserProfile } from '@/lib/stores/user_profile';
import dayjs from 'dayjs';

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

function getDateString(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

function getActiveHabitsForDay(habits: Habit[], date: string): Habit[] {
  const dayOfWeek = dayjs(date).day(); // 0=Sun, 1=Mon, ... 6=Sat

  return habits.filter((habit) => {
    const habitStartDateString = getDateString(habit.start_date);
    const habitEndDateString = habit.end_date
      ? getDateString(habit.end_date)
      : null;

    const existsOnDate =
      habitStartDateString <= date &&
      (!habitEndDateString || date <= habitEndDateString);

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

  relevantHabits.forEach((habit) => {
    if (checkHabitCompletion(habit, date, completionsMap)) {
      totalScoreEarned += pointsPerHabit;
    }
  });

  return Math.min(100, totalScoreEarned);
}

export function calculateDMS(
  userProfile: UserProfile,
  allHabits: Habit[],
  completionsHistory: HabitCompletion[]
): DisplayedMatrixScore {
  const categories = CATEGORY_IDS;

  const completionsMap = new Map<string, HabitCompletion>();
  completionsHistory.forEach((comp) => {
    const dateString = getDateString(comp.completion_date);
    const key = `${comp.habit_id}_${dateString}`;
    completionsMap.set(key, comp);
  });

  const finalScores: Partial<DisplayedMatrixScore> = {};
  categories.forEach((category) => {
    let smoothedScore = getBaselineScore(category, userProfile);

    for (let i = LOOKBACK_WINDOW - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dateString = getDateString(date.toDate());

      const dps = calculateDPS(category, dateString, allHabits, completionsMap);

      if (dps >= 0) {
        smoothedScore =
          SMOOTHING_FACTOR * dps + (1 - SMOOTHING_FACTOR) * smoothedScore;
      }
    }

    finalScores[category] = Math.round(smoothedScore);
  });

  return {
    body: finalScores.body ?? 50,
    mind: finalScores.mind ?? 50,
    heart: finalScores.heart ?? 50,
    spirit: finalScores.spirit ?? 50,
    work: finalScores.work ?? 50,
    calculated_at: dayjs().toDate(),
  };
}
