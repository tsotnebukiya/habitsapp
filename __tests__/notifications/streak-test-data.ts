import {
  StreakCompletionFactory,
  StreakHabitFactory,
  StreakScenarioBuilder,
  StreakUserFactory,
  TestUserWithHabits,
} from './streak-factories';

// Comprehensive test scenarios covering all edge cases
export const streakTestScenarios = {
  // EDGE CASE 1: Today complete, yesterday complete, gap before
  todayCompleteWithGap: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-1' });
    return new StreakScenarioBuilder('Today complete with gap before')
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions([
        StreakCompletionFactory.createCompleted(
          '2025-05-30T10:00:00Z',
          'habit-1'
        ), // Today
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-1'
        ), // Yesterday
        // Gap on 2025-05-28
        StreakCompletionFactory.createCompleted(
          '2025-05-27T10:00:00Z',
          'habit-1'
        ), // 3 days ago
      ])
      .expectStreak(2) // Today + yesterday only
      .expectMilestone(3, 1)
      .expectNotification('oneDay')
      .build();
  })(),

  // EDGE CASE 2: Today not complete, but yesterday was
  todayNotComplete: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-2' });
    return new StreakScenarioBuilder('Today not complete')
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions([
        // No completion for today (2025-05-30)
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-2'
        ), // Yesterday
        StreakCompletionFactory.createCompleted(
          '2025-05-28T10:00:00Z',
          'habit-2'
        ), // Day before
        StreakCompletionFactory.createCompleted(
          '2025-05-27T10:00:00Z',
          'habit-2'
        ), // 3 days ago
      ])
      .expectStreak(0) // Streak broken because today not complete
      .expectNoNotification()
      .build();
  })(),

  // EDGE CASE 3: Timezone boundary issues
  timezoneBoundary: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-3' });
    return new StreakScenarioBuilder('Timezone boundary (Tokyo user)')
      .withTimezone('Asia/Tokyo')
      .withCurrentDate('2025-05-30T15:00:00Z') // 12:00 AM Tokyo next day
      .withHabit(habit)
      .withCompletions([
        // Completed at 11 PM Tokyo time = 2 PM UTC same day
        StreakCompletionFactory.createCompleted(
          '2025-05-30T14:00:00Z',
          'habit-3'
        ),
        StreakCompletionFactory.createCompleted(
          '2025-05-29T14:00:00Z',
          'habit-3'
        ),
      ])
      .expectStreak(2) // Should count both days in Tokyo timezone
      .expectMilestone(3, 1)
      .expectNotification('oneDay')
      .build();
  })(),

  // EDGE CASE 4: Weekly habits - correct days
  weeklyHabitsCorrect: (() => {
    const habit = StreakHabitFactory.createWeekly([1, 3, 5], { id: 'habit-4' }); // Monday, Wednesday, Friday
    return new StreakScenarioBuilder(
      'Weekly habit on Mon/Wed/Fri - all completed'
    )
      .withCurrentDate('2025-05-30T12:00:00Z') // Friday
      .withHabit(habit)
      .withCompletions([
        StreakCompletionFactory.createCompleted(
          '2025-05-30T10:00:00Z',
          'habit-4'
        ), // Friday
        StreakCompletionFactory.createCompleted(
          '2025-05-28T10:00:00Z',
          'habit-4'
        ), // Wednesday
        StreakCompletionFactory.createCompleted(
          '2025-05-26T10:00:00Z',
          'habit-4'
        ), // Monday
        StreakCompletionFactory.createCompleted(
          '2025-05-23T10:00:00Z',
          'habit-4'
        ), // Previous Friday
      ])
      .expectStreak(4) // All required days completed
      .expectMilestone(7, 3)
      .expectNoNotification() // Not 1 or 2 days away
      .build();
  })(),

  // EDGE CASE 5: Weekly habits - wrong day completion
  weeklyHabitsWrongDay: (() => {
    const habit = StreakHabitFactory.createWeekly([1, 3, 5], { id: 'habit-5' }); // Monday, Wednesday, Friday
    return new StreakScenarioBuilder(
      'Weekly habit on Mon/Wed/Fri but completed on Tuesday'
    )
      .withCurrentDate('2025-05-30T12:00:00Z') // Friday
      .withHabit(habit)
      .withCompletions([
        StreakCompletionFactory.createCompleted(
          '2025-05-30T10:00:00Z',
          'habit-5'
        ), // Friday ✓
        StreakCompletionFactory.createCompleted(
          '2025-05-27T10:00:00Z',
          'habit-5'
        ), // Tuesday ✗ (wrong day)
        StreakCompletionFactory.createCompleted(
          '2025-05-26T10:00:00Z',
          'habit-5'
        ), // Monday ✓
      ])
      .expectStreak(1) // Only Friday counts, Wednesday was missed
      .expectNoNotification()
      .build();
  })(),

  // EDGE CASE 6: Multiple habits - partial completion
  multipleHabitsPartial: (() => {
    const habits = [
      StreakHabitFactory.create({ id: 'habit-6a', name: 'Exercise' }),
      StreakHabitFactory.create({ id: 'habit-6b', name: 'Reading' }),
      StreakHabitFactory.create({ id: 'habit-6c', name: 'Meditation' }),
    ];

    const completions = [
      // Today: only 2 out of 3 completed
      StreakCompletionFactory.createCompleted(
        '2025-05-30T10:00:00Z',
        'habit-6a'
      ),
      StreakCompletionFactory.createCompleted(
        '2025-05-30T10:00:00Z',
        'habit-6b'
      ),
      // habit-6c not completed today

      // Yesterday: all 3 completed
      StreakCompletionFactory.createCompleted(
        '2025-05-29T10:00:00Z',
        'habit-6a'
      ),
      StreakCompletionFactory.createCompleted(
        '2025-05-29T10:00:00Z',
        'habit-6b'
      ),
      StreakCompletionFactory.createCompleted(
        '2025-05-29T10:00:00Z',
        'habit-6c'
      ),
    ];

    return new StreakScenarioBuilder(
      'User has 3 habits, only completed 2 out of 3 today'
    )
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habits[0])
      .withHabit(habits[1])
      .withHabit(habits[2])
      .withCompletions(completions)
      .expectStreak(0) // Today not complete (missing habit-6c)
      .expectNoNotification()
      .build();
  })(),

  // EDGE CASE 7: Skipped status counts as completed
  skippedStatus: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-7' });
    return new StreakScenarioBuilder(
      'User skipped habit (should count toward streak)'
    )
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions([
        StreakCompletionFactory.createSkipped(
          '2025-05-30T10:00:00Z',
          'habit-7'
        ), // Today (skipped)
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-7'
        ), // Yesterday
        StreakCompletionFactory.createCompleted(
          '2025-05-28T10:00:00Z',
          'habit-7'
        ), // Day before
      ])
      .expectStreak(3) // Skipped should count
      .expectMilestone(7, 4)
      .expectNoNotification()
      .build();
  })(),

  // EDGE CASE 8: Habit with end date in past
  habitEndedInPast: (() => {
    const habit = StreakHabitFactory.createWithEndDate('2025-05-29T23:59:59Z', {
      id: 'habit-8',
    }); // Ended yesterday
    return new StreakScenarioBuilder(
      'Habit ended yesterday, should not be considered for today'
    )
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions([
        // No completion for today (habit ended)
        StreakCompletionFactory.createCompleted(
          '2025-05-29T10:00:00Z',
          'habit-8'
        ), // Yesterday (last day)
        StreakCompletionFactory.createCompleted(
          '2025-05-28T10:00:00Z',
          'habit-8'
        ), // Day before
      ])
      .expectStreak(2) // Yesterday + day before (today has no active habits)
      .expectNoNotification()
      .build();
  })(),

  // EDGE CASE 9: User at exact milestone
  exactMilestone: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-9' });
    const completions = StreakCompletionFactory.createSequence(
      '2025-05-24T10:00:00Z',
      7,
      'habit-9'
    );
    return new StreakScenarioBuilder(
      'User has exactly 7-day streak (at milestone)'
    )
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions(completions)
      .expectStreak(7)
      .expectMilestone(14, 7) // Next milestone after 7
      .expectNoNotification() // Not 1 or 2 days away
      .build();
  })(),

  // EDGE CASE 10: User 1 day from milestone
  oneDayFromMilestone: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-10' });
    const completions = StreakCompletionFactory.createSequence(
      '2025-05-25T10:00:00Z',
      6,
      'habit-10'
    );
    return new StreakScenarioBuilder('User is 1 day away from 7-day milestone')
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions(completions)
      .expectStreak(6)
      .expectMilestone(7, 1)
      .expectNotification('oneDay')
      .build();
  })(),

  // EDGE CASE 11: User 2 days from milestone
  twoDaysFromMilestone: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-11' });
    const completions = StreakCompletionFactory.createSequence(
      '2025-05-26T10:00:00Z',
      5,
      'habit-11'
    );
    return new StreakScenarioBuilder('User is 2 days away from 7-day milestone')
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions(completions)
      .expectStreak(5)
      .expectMilestone(7, 2)
      .expectNotification('twoDay')
      .build();
  })(),

  // EDGE CASE 12: User with no habits
  noHabits: new StreakScenarioBuilder('User with no active habits')
    .withCurrentDate('2025-05-30T12:00:00Z')
    .expectStreak(0)
    .expectNoNotification()
    .build(),

  // EDGE CASE 13: Long streak sequence
  longStreak: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-13' });
    const completions = StreakCompletionFactory.createSequence(
      '2025-05-01T10:00:00Z',
      30,
      'habit-13'
    );
    return new StreakScenarioBuilder('User with 30-day streak')
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions(completions)
      .expectStreak(30)
      .expectMilestone(60, 30) // Next milestone after 30
      .expectNoNotification() // Not 1 or 2 days away
      .build();
  })(),

  // EDGE CASE 14: Mixed completion statuses
  mixedStatuses: (() => {
    const habit = StreakHabitFactory.create({ id: 'habit-14' });
    return new StreakScenarioBuilder('Mixed completed and skipped statuses')
      .withCurrentDate('2025-05-30T12:00:00Z')
      .withHabit(habit)
      .withCompletions([
        StreakCompletionFactory.createCompleted(
          '2025-05-30T10:00:00Z',
          'habit-14'
        ), // Today
        StreakCompletionFactory.createSkipped(
          '2025-05-29T10:00:00Z',
          'habit-14'
        ), // Yesterday (skipped)
        StreakCompletionFactory.createCompleted(
          '2025-05-28T10:00:00Z',
          'habit-14'
        ), // Day before
        StreakCompletionFactory.createSkipped(
          '2025-05-27T10:00:00Z',
          'habit-14'
        ), // 3 days ago (skipped)
        StreakCompletionFactory.createCompleted(
          '2025-05-26T10:00:00Z',
          'habit-14'
        ), // 4 days ago
      ])
      .expectStreak(5) // All should count (completed + skipped)
      .expectMilestone(7, 2)
      .expectNotification('twoDay')
      .build();
  })(),
};

// Helper function to create test users from scenarios
export function createTestUserFromScenario(
  scenarioName: keyof typeof streakTestScenarios,
  userOverrides: Partial<TestUserWithHabits> = {}
): TestUserWithHabits {
  const scenario = streakTestScenarios[scenarioName];

  return StreakUserFactory.createWithHabits(
    scenario.habits,
    scenario.completions,
    {
      timezone: scenario.timezone,
      ...userOverrides,
    }
  );
}

// Helper function to get all scenario names for iteration
export function getAllScenarioNames(): (keyof typeof streakTestScenarios)[] {
  return Object.keys(
    streakTestScenarios
  ) as (keyof typeof streakTestScenarios)[];
}

// Helper function to get scenarios by category
export function getScenariosByCategory() {
  return {
    basicLogic: [
      'todayCompleteWithGap',
      'todayNotComplete',
      'skippedStatus',
      'mixedStatuses',
    ],
    timezone: ['timezoneBoundary'],
    weeklyHabits: ['weeklyHabitsCorrect', 'weeklyHabitsWrongDay'],
    multipleHabits: ['multipleHabitsPartial'],
    dateRanges: ['habitEndedInPast'],
    milestones: [
      'exactMilestone',
      'oneDayFromMilestone',
      'twoDaysFromMilestone',
    ],
    edgeCases: ['noHabits', 'longStreak'],
  };
}
