import dayjs from 'dayjs';

// Types for streak testing (simplified versions of the actual types)
export interface TestHabit {
  id: string;
  name: string;
  user_id: string;
  frequency_type: 'daily' | 'weekly';
  start_date: string;
  end_date: string | null;
  days_of_week: number[] | null;
  is_active: boolean;
}

export interface TestHabitCompletion {
  id: string;
  habit_id: string;
  completion_date: string;
  status: 'completed' | 'skipped' | 'not_started' | 'in_progress';
  user_id: string;
  value: number | null;
  created_at: string;
}

export interface TestUserWithHabits {
  id: string;
  push_token: string;
  timezone: string;
  preferred_language: string;
  streak_achievements: Record<string, boolean>;
  habits: (TestHabit & { completions: TestHabitCompletion[] })[];
}

export interface TestUserWithCurrentStreak {
  id: string;
  push_token: string;
  timezone: string;
  preferred_language: string;
  streak_achievements: Record<string, boolean>;
  current_streak: number;
}

let idCounter = 1;

export class StreakHabitFactory {
  static create(overrides: Partial<TestHabit> = {}): TestHabit {
    return {
      id: `test-habit-${idCounter++}`,
      name: 'Test Habit',
      user_id: 'test-user-1',
      frequency_type: 'daily',
      start_date: '2025-05-01T00:00:00Z',
      end_date: null,
      days_of_week: null,
      is_active: true,
      ...overrides,
    };
  }

  static createWeekly(
    days: number[],
    overrides: Partial<TestHabit> = {}
  ): TestHabit {
    return this.create({
      frequency_type: 'weekly',
      days_of_week: days,
      ...overrides,
    });
  }

  static createWithEndDate(
    endDate: string,
    overrides: Partial<TestHabit> = {}
  ): TestHabit {
    return this.create({
      end_date: endDate,
      ...overrides,
    });
  }
}

export class StreakCompletionFactory {
  static create(
    overrides: Partial<TestHabitCompletion> = {}
  ): TestHabitCompletion {
    const date = overrides.completion_date || '2025-05-30T10:00:00Z';
    return {
      id: `test-completion-${idCounter++}`,
      habit_id: 'test-habit-1',
      completion_date: date,
      status: 'completed',
      user_id: 'test-user-1',
      value: null,
      created_at: date,
      ...overrides,
    };
  }

  static createSkipped(
    date: string,
    habitId: string = 'test-habit-1'
  ): TestHabitCompletion {
    return this.create({
      completion_date: date,
      habit_id: habitId,
      status: 'skipped',
    });
  }

  static createCompleted(
    date: string,
    habitId: string = 'test-habit-1'
  ): TestHabitCompletion {
    return this.create({
      completion_date: date,
      habit_id: habitId,
      status: 'completed',
    });
  }

  static createSequence(
    startDate: string,
    days: number,
    habitId: string = 'test-habit-1',
    status: 'completed' | 'skipped' = 'completed'
  ): TestHabitCompletion[] {
    const completions: TestHabitCompletion[] = [];
    for (let i = 0; i < days; i++) {
      const date = dayjs(startDate)
        .add(i, 'day')
        .format('YYYY-MM-DDTHH:mm:ss[Z]');
      completions.push(
        this.create({
          completion_date: date,
          habit_id: habitId,
          status,
        })
      );
    }
    return completions;
  }
}

export class StreakUserFactory {
  static create(
    overrides: Partial<TestUserWithHabits> = {}
  ): TestUserWithHabits {
    return {
      id: 'test-user-1',
      push_token: 'test-token',
      timezone: 'UTC',
      preferred_language: 'en',
      streak_achievements: {
        streak_3: false,
        streak_7: false,
        streak_14: false,
        streak_30: false,
        streak_60: false,
        streak_90: false,
        streak_180: false,
        streak_365: false,
      },
      habits: [],
      ...overrides,
    };
  }

  static createWithHabits(
    habits: TestHabit[],
    completions: TestHabitCompletion[],
    overrides: Partial<TestUserWithHabits> = {}
  ): TestUserWithHabits {
    const habitsWithCompletions = habits.map((habit) => ({
      ...habit,
      completions: completions.filter((c) => c.habit_id === habit.id),
    }));

    return this.create({
      habits: habitsWithCompletions,
      ...overrides,
    });
  }

  static createWithTimezone(
    timezone: string,
    overrides: Partial<TestUserWithHabits> = {}
  ): TestUserWithHabits {
    return this.create({
      timezone,
      ...overrides,
    });
  }

  static createWithAchievements(
    achievements: Record<string, boolean>,
    overrides: Partial<TestUserWithHabits> = {}
  ): TestUserWithHabits {
    return this.create({
      streak_achievements: {
        streak_3: false,
        streak_7: false,
        streak_14: false,
        streak_30: false,
        streak_60: false,
        streak_90: false,
        streak_180: false,
        streak_365: false,
        ...achievements,
      },
      ...overrides,
    });
  }
}

// Test scenario builder for complex edge cases
export class StreakScenarioBuilder {
  private scenario: {
    description: string;
    timezone: string;
    currentDate: string;
    habits: TestHabit[];
    completions: TestHabitCompletion[];
    expectedStreak: number;
    expectedMilestone?: number;
    expectedDaysToMilestone?: number;
    shouldNotify?: boolean;
    notificationType?: 'oneDay' | 'twoDay';
  };

  constructor(description: string) {
    this.scenario = {
      description,
      timezone: 'UTC',
      currentDate: '2025-05-30T12:00:00Z',
      habits: [],
      completions: [],
      expectedStreak: 0,
    };
  }

  withTimezone(timezone: string): this {
    this.scenario.timezone = timezone;
    return this;
  }

  withCurrentDate(date: string): this {
    this.scenario.currentDate = date;
    return this;
  }

  withHabit(habit: TestHabit): this {
    this.scenario.habits.push(habit);
    return this;
  }

  withCompletions(completions: TestHabitCompletion[]): this {
    this.scenario.completions.push(...completions);
    return this;
  }

  expectStreak(streak: number): this {
    this.scenario.expectedStreak = streak;
    return this;
  }

  expectMilestone(milestone: number, daysToMilestone: number): this {
    this.scenario.expectedMilestone = milestone;
    this.scenario.expectedDaysToMilestone = daysToMilestone;
    return this;
  }

  expectNotification(type: 'oneDay' | 'twoDay'): this {
    this.scenario.shouldNotify = true;
    this.scenario.notificationType = type;
    return this;
  }

  expectNoNotification(): this {
    this.scenario.shouldNotify = false;
    return this;
  }

  build() {
    return this.scenario;
  }
}

// Utility function to mock current time for testing
export function mockCurrentTime(dateString: string): () => void {
  const originalNow = Date.now;
  Date.now = () => new Date(dateString).getTime();
  return () => {
    Date.now = originalNow;
  };
}
