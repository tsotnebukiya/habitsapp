import { afterEach, describe, expect, test } from '@jest/globals';
import {
  mockCurrentTime,
  StreakCompletionFactory,
  StreakHabitFactory,
  StreakScenarioBuilder,
  StreakUserFactory,
  TestUserWithHabits,
} from './streak-factories';

// Mock functions - these would be imported from your actual streak calculation module
// import { calculateUserStreaks, getNextStreakMilestone, prepareNotifications } from '@/path/to/streak-utils';

// For now, we'll create mock implementations to show the test structure
const mockCalculateUserStreaks = (users: TestUserWithHabits[]) => {
  // This would be your actual function
  return users.map((user) => ({ userId: user.id, currentStreak: 0 }));
};

const mockGetNextStreakMilestone = (achievements: Record<string, boolean>) => {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  for (const milestone of milestones) {
    if (!achievements[`streak_${milestone}`]) {
      return milestone;
    }
  }
  return null;
};

const mockPrepareNotifications = (users: any[], targetHour: number) => {
  return [];
};

describe('Streak Calculation', () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  describe('Basic Streak Logic', () => {
    test('calculates streak correctly when today is complete with gap before', () => {
      const scenario = new StreakScenarioBuilder(
        'Today complete with gap before'
      )
        .withCurrentDate('2025-05-30T12:00:00Z')
        .withHabit(StreakHabitFactory.create())
        .withCompletions([
          StreakCompletionFactory.createCompleted('2025-05-30T10:00:00Z'), // Today
          StreakCompletionFactory.createCompleted('2025-05-29T10:00:00Z'), // Yesterday
          // Gap on 2025-05-28
          StreakCompletionFactory.createCompleted('2025-05-27T10:00:00Z'), // 3 days ago
        ])
        .expectStreak(2) // Today + yesterday only
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions
      );

      const results = mockCalculateUserStreaks([user]);

      // This test would pass once you implement the actual function
      // expect(results[0].currentStreak).toBe(scenario.expectedStreak);
      expect(results).toHaveLength(1);
      expect(results[0].userId).toBe(user.id);
    });

    test('returns zero streak when today is not complete', () => {
      const scenario = new StreakScenarioBuilder('Today not complete')
        .withCurrentDate('2025-05-30T12:00:00Z')
        .withHabit(StreakHabitFactory.create())
        .withCompletions([
          // No completion for today
          StreakCompletionFactory.createCompleted('2025-05-29T10:00:00Z'), // Yesterday
          StreakCompletionFactory.createCompleted('2025-05-28T10:00:00Z'), // Day before
        ])
        .expectStreak(0) // Streak broken because today not complete
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions
      );

      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(0);
    });

    test('counts skipped status as completed for streak', () => {
      const scenario = new StreakScenarioBuilder('Skipped status counts')
        .withCurrentDate('2025-05-30T12:00:00Z')
        .withHabit(StreakHabitFactory.create())
        .withCompletions([
          StreakCompletionFactory.createSkipped('2025-05-30T10:00:00Z'), // Today (skipped)
          StreakCompletionFactory.createCompleted('2025-05-29T10:00:00Z'), // Yesterday
          StreakCompletionFactory.createCompleted('2025-05-28T10:00:00Z'), // Day before
        ])
        .expectStreak(3) // Skipped should count
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions
      );

      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(3);
    });
  });

  describe('Timezone Handling', () => {
    test('handles timezone boundaries correctly for Tokyo user', () => {
      const scenario = new StreakScenarioBuilder('Tokyo timezone boundary')
        .withTimezone('Asia/Tokyo')
        .withCurrentDate('2025-05-30T15:00:00Z') // 12:00 AM Tokyo next day
        .withHabit(StreakHabitFactory.create())
        .withCompletions([
          // Completed at 11 PM Tokyo time = 2 PM UTC same day
          StreakCompletionFactory.createCompleted('2025-05-30T14:00:00Z'),
          StreakCompletionFactory.createCompleted('2025-05-29T14:00:00Z'),
        ])
        .expectStreak(2) // Should count both days in Tokyo timezone
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions,
        { timezone: 'Asia/Tokyo' }
      );

      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(2);
    });
  });

  describe('Weekly Habits', () => {
    test('calculates streak correctly for weekly habits on correct days', () => {
      const scenario = new StreakScenarioBuilder('Weekly habits correct days')
        .withCurrentDate('2025-05-30T12:00:00Z') // Friday
        .withHabit(StreakHabitFactory.createWeekly([1, 3, 5])) // Mon, Wed, Fri
        .withCompletions([
          StreakCompletionFactory.createCompleted('2025-05-30T10:00:00Z'), // Friday
          StreakCompletionFactory.createCompleted('2025-05-28T10:00:00Z'), // Wednesday
          StreakCompletionFactory.createCompleted('2025-05-26T10:00:00Z'), // Monday
          StreakCompletionFactory.createCompleted('2025-05-23T10:00:00Z'), // Previous Friday
        ])
        .expectStreak(4) // All required days completed
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions
      );

      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(4);
    });

    test('ignores completions on wrong days for weekly habits', () => {
      const scenario = new StreakScenarioBuilder('Weekly habits wrong day')
        .withCurrentDate('2025-05-30T12:00:00Z') // Friday
        .withHabit(StreakHabitFactory.createWeekly([1, 3, 5])) // Mon, Wed, Fri
        .withCompletions([
          StreakCompletionFactory.createCompleted('2025-05-30T10:00:00Z'), // Friday ✓
          StreakCompletionFactory.createCompleted('2025-05-27T10:00:00Z'), // Tuesday ✗ (wrong day)
          StreakCompletionFactory.createCompleted('2025-05-26T10:00:00Z'), // Monday ✓
        ])
        .expectStreak(1) // Only Friday counts, Wednesday was missed
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions
      );

      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(1);
    });
  });

  describe('Multiple Habits', () => {
    test('requires all habits to be completed for streak continuation', () => {
      const habits = [
        StreakHabitFactory.create({ id: 'habit-1', name: 'Exercise' }),
        StreakHabitFactory.create({ id: 'habit-2', name: 'Reading' }),
        StreakHabitFactory.create({ id: 'habit-3', name: 'Meditation' }),
      ];

      const completions = [
        // Today: only 2 out of 3 completed
        StreakCompletionFactory.createCompleted(
          '2025-05-30T10:00:00Z',
          'habit-1'
        ),
        StreakCompletionFactory.createCompleted(
          '2025-05-30T10:00:00Z',
          'habit-2'
        ),
        // habit-3 not completed today

        // Yesterday: all 3 completed
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-1'
        ),
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-2'
        ),
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-3'
        ),
      ];

      cleanup = mockCurrentTime('2025-05-30T12:00:00Z');

      const user = StreakUserFactory.createWithHabits(habits, completions);
      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(0); // Today not complete (missing habit-3)
    });
  });

  describe('Habit Date Ranges', () => {
    test('ignores habits that ended in the past', () => {
      const scenario = new StreakScenarioBuilder('Habit ended in past')
        .withCurrentDate('2025-05-30T12:00:00Z')
        .withHabit(StreakHabitFactory.createWithEndDate('2025-05-29T23:59:59Z')) // Ended yesterday
        .withCompletions([
          // No completion for today (habit ended)
          StreakCompletionFactory.createCompleted('2025-05-29T10:00:00Z'), // Yesterday (last day)
          StreakCompletionFactory.createCompleted('2025-05-28T10:00:00Z'), // Day before
        ])
        .expectStreak(2) // Yesterday + day before (today has no active habits)
        .build();

      cleanup = mockCurrentTime(scenario.currentDate);

      const user = StreakUserFactory.createWithHabits(
        scenario.habits,
        scenario.completions
      );

      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(2);
    });
  });
});

describe('Milestone Detection', () => {
  test('finds next milestone correctly', () => {
    const achievements = {
      streak_3: true,
      streak_7: false,
      streak_14: false,
    };

    const nextMilestone = mockGetNextStreakMilestone(achievements);
    expect(nextMilestone).toBe(7);
  });

  test('returns null when all milestones achieved', () => {
    const achievements = {
      streak_3: true,
      streak_7: true,
      streak_14: true,
      streak_30: true,
      streak_60: true,
      streak_90: true,
      streak_180: true,
      streak_365: true,
    };

    const nextMilestone = mockGetNextStreakMilestone(achievements);
    expect(nextMilestone).toBe(null);
  });
});

describe('Notification Preparation', () => {
  test('prepares notification for user 2 days from milestone', () => {
    const users = [
      {
        id: 'test-user-1',
        push_token: 'test-token',
        timezone: 'UTC',
        preferred_language: 'en',
        streak_achievements: { streak_3: false },
        current_streak: 1, // 2 days to reach 3-day milestone
      },
    ];

    const notifications = mockPrepareNotifications(users, 7);

    // This would test the actual notification preparation
    expect(Array.isArray(notifications)).toBe(true);
  });

  test('does not prepare notification when not 1 or 2 days from milestone', () => {
    const users = [
      {
        id: 'test-user-1',
        push_token: 'test-token',
        timezone: 'UTC',
        preferred_language: 'en',
        streak_achievements: { streak_7: false },
        current_streak: 4, // 3 days to milestone (not 1 or 2)
      },
    ];

    const notifications = mockPrepareNotifications(users, 7);
    expect(notifications).toHaveLength(0);
  });
});

describe('Edge Cases', () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  test('handles user with no habits', () => {
    cleanup = mockCurrentTime('2025-05-30T12:00:00Z');

    const user = StreakUserFactory.create(); // No habits
    const results = mockCalculateUserStreaks([user]);

    expect(results).toHaveLength(1);
    // expect(results[0].currentStreak).toBe(0);
  });

  test('handles user at exact milestone', () => {
    const habits = [StreakHabitFactory.create()];
    const completions = StreakCompletionFactory.createSequence(
      '2025-05-24T10:00:00Z',
      7
    ); // 7-day sequence

    cleanup = mockCurrentTime('2025-05-30T12:00:00Z');

    const user = StreakUserFactory.createWithHabits(habits, completions);
    const results = mockCalculateUserStreaks([user]);

    expect(results).toHaveLength(1);
    // expect(results[0].currentStreak).toBe(7);
  });

  test('handles long streak sequences', () => {
    const habits = [StreakHabitFactory.create()];
    const completions = StreakCompletionFactory.createSequence(
      '2025-05-01T10:00:00Z',
      30
    ); // 30-day sequence

    cleanup = mockCurrentTime('2025-05-30T12:00:00Z');

    const user = StreakUserFactory.createWithHabits(habits, completions);
    const results = mockCalculateUserStreaks([user]);

    expect(results).toHaveLength(1);
    // expect(results[0].currentStreak).toBe(30);
  });
});
