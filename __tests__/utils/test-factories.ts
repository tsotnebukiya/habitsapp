import { Habit, HabitCompletion } from '@/lib/habit-store/types';
import dayjs from 'dayjs';

let idCounter = 1;

export class HabitFactory {
  static create(overrides: Partial<Habit> = {}): Habit {
    const baseHabit: Habit = {
      id: overrides.id || `test-uuid-${idCounter}`,
      name: 'word1 word2',
      user_id: 'test-user-id', // Use consistent test user ID
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: null,
      is_active: true,
      frequency_type: 'daily',
      goal_value: 1,
      goal_unit: 'times',
      completions_per_day: 1,
      type: 'GOOD',
      color: '#FF0000',
      icon: 'testword',
      category_name: 'testword',
      days_of_week: null,
      reminder_time: null,
      description: null,
      sort_id: idCounter++,
      streak_goal: null,
      gamification_attributes: null,
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
      ...overrides,
    };
    return baseHabit;
  }

  static createWeekly(overrides: Partial<Habit> = {}): Habit {
    return this.create({
      frequency_type: 'weekly',
      days_of_week: [1, 3, 5], // Monday, Wednesday, Friday
      ...overrides,
    });
  }

  static createWithEndDate(
    daysFromNow: number = 30,
    overrides: Partial<Habit> = {}
  ): Habit {
    return this.create({
      end_date: dayjs().add(daysFromNow, 'day').format('YYYY-MM-DD'),
      ...overrides,
    });
  }

  static createInactive(overrides: Partial<Habit> = {}): Habit {
    return this.create({
      is_active: false,
      ...overrides,
    });
  }

  static createWithGoal(
    goalValue: number,
    goalUnit: string,
    overrides: Partial<Habit> = {}
  ): Habit {
    return this.create({
      goal_value: goalValue,
      goal_unit: goalUnit,
      ...overrides,
    });
  }

  static createBatch(count: number): Habit[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        id: `test-habit-${i + 1}`,
        name: `Test Habit ${i + 1}`,
        sort_id: i + 1,
      })
    );
  }

  static createWithFrequency(
    frequency: 'daily' | 'weekly',
    overrides: Partial<Habit> = {}
  ): Habit {
    return this.create({
      frequency_type: frequency,
      days_of_week: frequency === 'weekly' ? [1, 3, 5] : null,
      ...overrides,
    });
  }
}

export class CompletionFactory {
  static create(
    habitId: string,
    overrides: Partial<HabitCompletion> = {}
  ): HabitCompletion {
    const baseCompletion: HabitCompletion = {
      id: `test-completion-${idCounter++}`,
      habit_id: habitId,
      user_id: 'test-user-id',
      completion_date: dayjs().format('YYYY-MM-DD'),
      value: 1,
      status: 'completed',
      created_at: dayjs().toISOString(),
      ...overrides,
    };
    return baseCompletion;
  }

  static createForDate(
    habitId: string,
    date: string,
    overrides: Partial<HabitCompletion> = {}
  ): HabitCompletion {
    return this.create(habitId, {
      completion_date: date,
      ...overrides,
    });
  }

  static createInProgress(
    habitId: string,
    overrides: Partial<HabitCompletion> = {}
  ): HabitCompletion {
    return this.create(habitId, {
      status: 'in_progress',
      ...overrides,
    });
  }

  static createStreak(
    habitId: string,
    length: number,
    endDate: string = dayjs().format('YYYY-MM-DD')
  ): HabitCompletion[] {
    return Array.from({ length }, (_, i) =>
      this.create(habitId, {
        id: `test-completion-${habitId}-streak-${i + 1}`,
        completion_date: dayjs(endDate)
          .subtract(length - 1 - i, 'day')
          .format('YYYY-MM-DD'),
      })
    );
  }

  static createBatch(habitId: string, count: number): HabitCompletion[] {
    return Array.from({ length: count }, (_, i) =>
      this.create(habitId, {
        id: `test-completion-${habitId}-${i + 1}`,
        completion_date: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
      })
    );
  }
}

export class DateFactory {
  static today(): string {
    return dayjs().format('YYYY-MM-DD');
  }

  static yesterday(): string {
    return dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  }

  static tomorrow(): string {
    return dayjs().add(1, 'day').format('YYYY-MM-DD');
  }

  static daysAgo(days: number): string {
    return dayjs().subtract(days, 'day').format('YYYY-MM-DD');
  }

  static daysFromNow(days: number): string {
    return dayjs().add(days, 'day').format('YYYY-MM-DD');
  }

  static randomDateInRange(startDate: string, endDate: string): string {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffDays = end.diff(start, 'day');
    const randomDays = Math.floor(Math.random() * diffDays);
    return start.add(randomDays, 'day').format('YYYY-MM-DD');
  }

  static getWeekDates(weekStart: string): string[] {
    const start = dayjs(weekStart);
    return Array.from({ length: 7 }, (_, index) =>
      start.add(index, 'day').format('YYYY-MM-DD')
    );
  }
}

export class UserFactory {
  static create(overrides: any = {}): any {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      created_at: dayjs().toISOString(),
      ...overrides,
    };
  }
}
