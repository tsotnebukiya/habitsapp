import type {
  Habit,
  HabitCompletion,
  HabitInteractionSurface,
} from '@/lib/habit-store/types';

export function buildHabitAnalyticsProperties(
  habit: Habit,
  interactionSurface: HabitInteractionSurface = 'unknown'
) {
  return {
    habit_id: habit.id,
    habit_type: habit.type,
    category_name: habit.category_name,
    goal_value: habit.goal_value ?? habit.completions_per_day ?? null,
    goal_unit: habit.goal_unit ?? null,
    frequency_type: habit.frequency_type,
    interaction_surface: interactionSurface,
  };
}

export function hasCompletedHabitBefore(
  completions: Iterable<HabitCompletion>,
  habitId: string
) {
  for (const completion of completions) {
    if (completion.habit_id === habitId && completion.status === 'completed') {
      return true;
    }
  }

  return false;
}

function serializeValue(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return value;
}

export function getHabitChangedFields(
  habit: Habit,
  updates: Partial<Habit>
): string[] {
  return Object.keys(updates).filter((field) => {
    const key = field as keyof Habit;
    return serializeValue(habit[key]) !== serializeValue(updates[key]);
  });
}
