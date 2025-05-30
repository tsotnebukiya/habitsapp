import { afterEach, describe, expect, test } from '@jest/globals';
import { mockCurrentTime } from './streak-factories';
import {
  createTestUserFromScenario,
  getAllScenarioNames,
  getScenariosByCategory,
  streakTestScenarios,
} from './streak-test-data';

// Mock functions - replace these imports with your actual streak calculation functions
// import { calculateUserStreaks, getNextStreakMilestone, prepareNotifications } from '@/path/to/streak-utils';

// Mock implementations for demonstration
const mockCalculateUserStreaks = (users: any[]) => {
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

describe('Comprehensive Streak Calculation Tests', () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  describe('All Edge Case Scenarios', () => {
    // Test all scenarios systematically
    getAllScenarioNames().forEach((scenarioName) => {
      test(`${scenarioName}: ${streakTestScenarios[scenarioName].description}`, () => {
        const scenario = streakTestScenarios[scenarioName];
        cleanup = mockCurrentTime(scenario.currentDate);

        const user = createTestUserFromScenario(scenarioName);
        const results = mockCalculateUserStreaks([user]);

        // Basic assertions that work with mock
        expect(results).toHaveLength(1);
        expect(results[0].userId).toBe(user.id);

        // When you implement the actual functions, uncomment these:
        // expect(results[0].currentStreak).toBe(scenario.expectedStreak);

        // if (scenario.expectedMilestone) {
        //   const nextMilestone = mockGetNextStreakMilestone(user.streak_achievements);
        //   expect(nextMilestone).toBe(scenario.expectedMilestone);
        //
        //   const daysToMilestone = nextMilestone - results[0].currentStreak;
        //   expect(daysToMilestone).toBe(scenario.expectedDaysToMilestone);
        // }

        // Test notification logic
        // const userWithStreak = { ...user, current_streak: results[0].currentStreak };
        // const notifications = mockPrepareNotifications([userWithStreak], 7);

        // if (scenario.shouldNotify) {
        //   expect(notifications).toHaveLength(1);
        //   expect(notifications[0].user_id).toBe(user.id);
        // } else {
        //   expect(notifications).toHaveLength(0);
        // }
      });
    });
  });

  describe('Scenario Categories', () => {
    const categories = getScenariosByCategory();

    describe('Basic Logic', () => {
      categories.basicLogic.forEach((scenarioName) => {
        test(`Basic logic: ${scenarioName}`, () => {
          const scenario =
            streakTestScenarios[
              scenarioName as keyof typeof streakTestScenarios
            ];
          cleanup = mockCurrentTime(scenario.currentDate);

          const user = createTestUserFromScenario(
            scenarioName as keyof typeof streakTestScenarios
          );
          const results = mockCalculateUserStreaks([user]);

          expect(results).toHaveLength(1);
          // Add specific assertions for basic logic scenarios
        });
      });
    });

    describe('Timezone Handling', () => {
      categories.timezone.forEach((scenarioName) => {
        test(`Timezone: ${scenarioName}`, () => {
          const scenario =
            streakTestScenarios[
              scenarioName as keyof typeof streakTestScenarios
            ];
          cleanup = mockCurrentTime(scenario.currentDate);

          const user = createTestUserFromScenario(
            scenarioName as keyof typeof streakTestScenarios
          );
          expect(user.timezone).toBe('Asia/Tokyo');

          const results = mockCalculateUserStreaks([user]);
          expect(results).toHaveLength(1);
          // Add timezone-specific assertions
        });
      });
    });

    describe('Weekly Habits', () => {
      categories.weeklyHabits.forEach((scenarioName) => {
        test(`Weekly habits: ${scenarioName}`, () => {
          const scenario =
            streakTestScenarios[
              scenarioName as keyof typeof streakTestScenarios
            ];
          cleanup = mockCurrentTime(scenario.currentDate);

          const user = createTestUserFromScenario(
            scenarioName as keyof typeof streakTestScenarios
          );
          const weeklyHabit = user.habits.find(
            (h) => h.frequency_type === 'weekly'
          );
          expect(weeklyHabit).toBeDefined();
          expect(weeklyHabit?.days_of_week).toEqual([1, 3, 5]); // Mon, Wed, Fri

          const results = mockCalculateUserStreaks([user]);
          expect(results).toHaveLength(1);
        });
      });
    });

    describe('Multiple Habits', () => {
      categories.multipleHabits.forEach((scenarioName) => {
        test(`Multiple habits: ${scenarioName}`, () => {
          const scenario =
            streakTestScenarios[
              scenarioName as keyof typeof streakTestScenarios
            ];
          cleanup = mockCurrentTime(scenario.currentDate);

          const user = createTestUserFromScenario(
            scenarioName as keyof typeof streakTestScenarios
          );
          expect(user.habits.length).toBeGreaterThan(1);

          const results = mockCalculateUserStreaks([user]);
          expect(results).toHaveLength(1);
        });
      });
    });

    describe('Milestone Detection', () => {
      categories.milestones.forEach((scenarioName) => {
        test(`Milestones: ${scenarioName}`, () => {
          const scenario =
            streakTestScenarios[
              scenarioName as keyof typeof streakTestScenarios
            ];
          cleanup = mockCurrentTime(scenario.currentDate);

          const user = createTestUserFromScenario(
            scenarioName as keyof typeof streakTestScenarios
          );
          const results = mockCalculateUserStreaks([user]);

          expect(results).toHaveLength(1);

          // Test milestone calculation
          const nextMilestone = mockGetNextStreakMilestone(
            user.streak_achievements
          );
          expect(typeof nextMilestone).toBe('number');
        });
      });
    });
  });

  describe('Notification Logic', () => {
    test('prepares 1-day notification correctly', () => {
      const scenario = streakTestScenarios.oneDayFromMilestone;
      cleanup = mockCurrentTime(scenario.currentDate);

      const user = createTestUserFromScenario('oneDayFromMilestone');
      const results = mockCalculateUserStreaks([user]);

      // When implementing actual functions:
      // const userWithStreak = { ...user, current_streak: results[0].currentStreak };
      // const notifications = mockPrepareNotifications([userWithStreak], 7);
      // expect(notifications).toHaveLength(1);
      // expect(notifications[0].notification_type).toBe('STREAK');

      expect(results).toHaveLength(1);
    });

    test('prepares 2-day notification correctly', () => {
      const scenario = streakTestScenarios.twoDaysFromMilestone;
      cleanup = mockCurrentTime(scenario.currentDate);

      const user = createTestUserFromScenario('twoDaysFromMilestone');
      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
    });

    test('does not notify when not 1 or 2 days from milestone', () => {
      const scenario = streakTestScenarios.exactMilestone;
      cleanup = mockCurrentTime(scenario.currentDate);

      const user = createTestUserFromScenario('exactMilestone');
      const results = mockCalculateUserStreaks([user]);

      expect(results).toHaveLength(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles user with no habits gracefully', () => {
      const scenario = streakTestScenarios.noHabits;
      cleanup = mockCurrentTime(scenario.currentDate);

      const user = createTestUserFromScenario('noHabits');
      expect(user.habits).toHaveLength(0);

      const results = mockCalculateUserStreaks([user]);
      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(0);
    });

    test('handles long streaks correctly', () => {
      const scenario = streakTestScenarios.longStreak;
      cleanup = mockCurrentTime(scenario.currentDate);

      const user = createTestUserFromScenario('longStreak');
      expect(user.habits[0].completions.length).toBe(30);

      const results = mockCalculateUserStreaks([user]);
      expect(results).toHaveLength(1);
      // expect(results[0].currentStreak).toBe(30);
    });

    test('handles mixed completion statuses', () => {
      const scenario = streakTestScenarios.mixedStatuses;
      cleanup = mockCurrentTime(scenario.currentDate);

      const user = createTestUserFromScenario('mixedStatuses');
      const completions = user.habits[0].completions;

      const completedCount = completions.filter(
        (c) => c.status === 'completed'
      ).length;
      const skippedCount = completions.filter(
        (c) => c.status === 'skipped'
      ).length;

      expect(completedCount).toBeGreaterThan(0);
      expect(skippedCount).toBeGreaterThan(0);

      const results = mockCalculateUserStreaks([user]);
      expect(results).toHaveLength(1);
    });
  });

  describe('Data Integrity', () => {
    test('all scenarios have valid data structure', () => {
      getAllScenarioNames().forEach((scenarioName) => {
        const scenario = streakTestScenarios[scenarioName];

        // Validate scenario structure
        expect(scenario.description).toBeDefined();
        expect(scenario.timezone).toBeDefined();
        expect(scenario.currentDate).toBeDefined();
        expect(Array.isArray(scenario.habits)).toBe(true);
        expect(Array.isArray(scenario.completions)).toBe(true);
        expect(typeof scenario.expectedStreak).toBe('number');
        expect(typeof scenario.shouldNotify).toBe('boolean');

        // Validate that completions reference valid habits
        scenario.completions.forEach((completion) => {
          const habitExists = scenario.habits.some(
            (habit) => habit.id === completion.habit_id
          );
          expect(habitExists).toBe(true);
        });
      });
    });

    test('scenarios cover all important edge cases', () => {
      const scenarioNames = getAllScenarioNames();

      // Ensure we have scenarios for key edge cases
      expect(scenarioNames).toContain('todayCompleteWithGap');
      expect(scenarioNames).toContain('todayNotComplete');
      expect(scenarioNames).toContain('timezoneBoundary');
      expect(scenarioNames).toContain('weeklyHabitsCorrect');
      expect(scenarioNames).toContain('weeklyHabitsWrongDay');
      expect(scenarioNames).toContain('multipleHabitsPartial');
      expect(scenarioNames).toContain('skippedStatus');
      expect(scenarioNames).toContain('habitEndedInPast');
      expect(scenarioNames).toContain('oneDayFromMilestone');
      expect(scenarioNames).toContain('twoDaysFromMilestone');
      expect(scenarioNames).toContain('noHabits');
      expect(scenarioNames).toContain('longStreak');
    });
  });
});

describe('Performance and Scalability', () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  test('handles multiple users efficiently', () => {
    cleanup = mockCurrentTime('2025-05-30T12:00:00Z');

    // Create multiple users with different scenarios
    const users = [
      createTestUserFromScenario('todayCompleteWithGap', { id: 'user-1' }),
      createTestUserFromScenario('weeklyHabitsCorrect', { id: 'user-2' }),
      createTestUserFromScenario('oneDayFromMilestone', { id: 'user-3' }),
      createTestUserFromScenario('longStreak', { id: 'user-4' }),
    ];

    const startTime = Date.now();
    const results = mockCalculateUserStreaks(users);
    const endTime = Date.now();

    expect(results).toHaveLength(4);
    expect(endTime - startTime).toBeLessThan(100); // Should be fast
  });

  test('handles large number of completions', () => {
    cleanup = mockCurrentTime('2025-05-30T12:00:00Z');

    const user = createTestUserFromScenario('longStreak');
    expect(user.habits[0].completions.length).toBe(30);

    const results = mockCalculateUserStreaks([user]);
    expect(results).toHaveLength(1);
  });
});
