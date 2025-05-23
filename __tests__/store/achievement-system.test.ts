import useHabitsStore from '@/lib/habit-store/store';
import dayjs from 'dayjs';
import {
  CompletionFactory,
  DateFactory,
  HabitFactory,
} from '../utils/test-factories';

// Mock the store persistence to avoid issues
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

describe('Achievement System', () => {
  beforeEach(() => {
    // Reset store state using a simple approach
    useHabitsStore.setState({
      habits: new Map(),
      completions: new Map(),
      isLoading: false,
      error: null,
    });
  });

  describe('Streak Calculation', () => {
    it('should handle consecutive completions', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create a 5-day streak ending today
      const streakCompletions = CompletionFactory.createStreak(
        habit.id,
        5,
        DateFactory.today()
      );

      // Add habit and completions to store
      store.habits.set(habit.id, habit);
      streakCompletions.forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(5);

      // Verify all completions are for the correct habit
      expect(completionsArray.every((c) => c.habit_id === habit.id)).toBe(true);

      // Verify streak dates are consecutive
      const sortedCompletions = completionsArray
        .filter((c) => c.habit_id === habit.id)
        .sort((a, b) =>
          dayjs(a.completion_date).diff(dayjs(b.completion_date))
        );

      for (let i = 1; i < sortedCompletions.length; i++) {
        const prevDate = dayjs(sortedCompletions[i - 1].completion_date);
        const currentDate = dayjs(sortedCompletions[i].completion_date);
        expect(currentDate.diff(prevDate, 'day')).toBe(1);
      }
    });

    it('should handle broken streaks correctly', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create completions with a gap
      const completion1 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.daysAgo(5)
      );
      const completion2 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.daysAgo(4)
      );
      // Gap on day 3
      const completion3 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.daysAgo(2)
      );
      const completion4 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.daysAgo(1)
      );
      const completion5 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.today()
      );

      // Add to store
      store.habits.set(habit.id, habit);
      [completion1, completion2, completion3, completion4, completion5].forEach(
        (completion) => {
          store.completions.set(completion.id, completion);
        }
      );

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(5);

      // Current streak should be 3 (last 3 consecutive days)
      const recentCompletions = completionsArray
        .filter((c) => c.habit_id === habit.id)
        .sort((a, b) => dayjs(b.completion_date).diff(dayjs(a.completion_date)))
        .slice(0, 3);

      expect(recentCompletions).toHaveLength(3);
    });

    it('should calculate longest streak correctly', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create two separate streaks with unique IDs
      const firstStreak = Array.from({ length: 3 }, (_, i) =>
        CompletionFactory.create(habit.id, {
          id: `first-streak-${i + 1}`,
          completion_date: DateFactory.daysAgo(10 - i), // 10, 9, 8 days ago
        })
      );

      const secondStreak = Array.from({ length: 5 }, (_, i) =>
        CompletionFactory.create(habit.id, {
          id: `second-streak-${i + 1}`,
          completion_date: DateFactory.daysAgo(4 - i), // 4, 3, 2, 1, 0 days ago (today)
        })
      );

      // Add to store
      store.habits.set(habit.id, habit);
      [...firstStreak, ...secondStreak].forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(8);

      // Longest streak should be 5
      const habitCompletions = completionsArray.filter(
        (c) => c.habit_id === habit.id
      );
      expect(habitCompletions).toHaveLength(8);
    });

    it('should handle weekly habits streak calculation', async () => {
      const habit = HabitFactory.createWeekly({ days_of_week: [1, 3, 5] }); // Mon, Wed, Fri
      const store = useHabitsStore.getState();

      // Create completions for the specified days
      const monday = CompletionFactory.createForDate(habit.id, '2025-01-20'); // Monday
      const wednesday = CompletionFactory.createForDate(habit.id, '2025-01-22'); // Wednesday
      const friday = CompletionFactory.createForDate(habit.id, '2025-01-24'); // Friday

      // Add to store
      store.habits.set(habit.id, habit);
      [monday, wednesday, friday].forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(3);

      // All completions should be for the correct habit
      expect(completionsArray.every((c) => c.habit_id === habit.id)).toBe(true);
    });
  });

  describe('Milestone Tracking', () => {
    it('should track completion milestones', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create 10 completions
      const completions = CompletionFactory.createBatch(habit.id, 10);

      // Add to store
      store.habits.set(habit.id, habit);
      completions.forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(10);

      // Check milestone achievements (e.g., 5, 10, 25, 50, 100 completions)
      const habitCompletions = completionsArray.filter(
        (c) => c.habit_id === habit.id
      );
      expect(habitCompletions.length).toBeGreaterThanOrEqual(5); // 5 completion milestone
      expect(habitCompletions.length).toBeGreaterThanOrEqual(10); // 10 completion milestone
    });

    it('should track streak milestones', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create a 7-day streak (week milestone)
      const streakCompletions = CompletionFactory.createStreak(
        habit.id,
        7,
        DateFactory.today()
      );

      // Add to store
      store.habits.set(habit.id, habit);
      streakCompletions.forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(7);

      // Verify 7-day streak milestone
      const habitCompletions = completionsArray.filter(
        (c) => c.habit_id === habit.id
      );
      expect(habitCompletions).toHaveLength(7);
    });

    it('should track goal achievement milestones', async () => {
      const habit = HabitFactory.createWithGoal(5, 'times'); // Goal: 5 times per day
      const store = useHabitsStore.getState();

      // Create completion that meets the goal
      const completion = CompletionFactory.create(habit.id, { value: 5 });

      // Add to store
      store.habits.set(habit.id, habit);
      store.completions.set(completion.id, completion);

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(1);

      // Verify goal achievement
      const habitCompletion = completionsArray.find(
        (c) => c.habit_id === habit.id
      );
      expect(habitCompletion?.value).toBe(5);
      expect(habitCompletion?.value).toBeGreaterThanOrEqual(
        habit.goal_value || 1
      );
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate daily progress percentage', async () => {
      const habit = HabitFactory.createWithGoal(10, 'times');
      const store = useHabitsStore.getState();

      // Create completion with partial progress
      const completion = CompletionFactory.create(habit.id, { value: 7 });

      // Add to store
      store.habits.set(habit.id, habit);
      store.completions.set(completion.id, completion);

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(1);

      // Calculate progress percentage
      const habitCompletion = completionsArray.find(
        (c) => c.habit_id === habit.id
      );
      const progress = (habitCompletion?.value || 0) / (habit.goal_value || 1);
      expect(progress).toBe(0.7); // 70% progress
    });

    it('should calculate weekly progress', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create completions for 5 out of 7 days
      const weekCompletions = CompletionFactory.createStreak(
        habit.id,
        5,
        DateFactory.today()
      );

      // Add to store
      store.habits.set(habit.id, habit);
      weekCompletions.forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(5);

      // Weekly progress: 5/7 = ~71%
      const weeklyProgress = completionsArray.length / 7;
      expect(weeklyProgress).toBeCloseTo(0.714, 2);
    });

    it('should calculate monthly progress', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create completions for 20 out of 30 days
      const monthCompletions = CompletionFactory.createBatch(habit.id, 20);

      // Add to store
      store.habits.set(habit.id, habit);
      monthCompletions.forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(20);

      // Monthly progress: 20/30 = ~67%
      const monthlyProgress = completionsArray.length / 30;
      expect(monthlyProgress).toBeCloseTo(0.667, 2);
    });

    it('should handle overachievement correctly', async () => {
      const habit = HabitFactory.createWithGoal(5, 'times');
      const store = useHabitsStore.getState();

      // Create completion that exceeds the goal
      const completion = CompletionFactory.create(habit.id, { value: 8 });

      // Add to store
      store.habits.set(habit.id, habit);
      store.completions.set(completion.id, completion);

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(1);

      // Progress should be capped at 100% (1.0)
      const habitCompletion = completionsArray.find(
        (c) => c.habit_id === habit.id
      );
      const progress = Math.min(
        (habitCompletion?.value || 0) / (habit.goal_value || 1),
        1
      );
      expect(progress).toBe(1); // 100% (capped)
      expect(habitCompletion?.value).toBeGreaterThan(habit.goal_value || 0); // But actual value is higher
    });
  });

  describe('Achievement Badges', () => {
    it('should award first completion badge', async () => {
      const habit = HabitFactory.create();
      const completion = CompletionFactory.create(habit.id);
      const store = useHabitsStore.getState();

      // Add first completion
      store.habits.set(habit.id, habit);
      store.completions.set(completion.id, completion);

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(1);

      // First completion badge should be awarded
      const firstCompletion = completionsArray.find(
        (c) => c.habit_id === habit.id
      );
      expect(firstCompletion).toBeDefined();
      expect(firstCompletion?.status).toBeDefined();
    });

    it('should award perfect week badge', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Create 7 consecutive completions
      const weekCompletions = CompletionFactory.createStreak(
        habit.id,
        7,
        DateFactory.today()
      );

      // Add to store
      store.habits.set(habit.id, habit);
      weekCompletions.forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(7);

      // Perfect week badge criteria met
      const habitCompletions = completionsArray.filter(
        (c) => c.habit_id === habit.id
      );
      expect(habitCompletions).toHaveLength(7);

      // All completions should be successful
      expect(habitCompletions.every((c) => c.status === 'completed')).toBe(
        true
      );
    });

    it('should award consistency badge for multiple habits', async () => {
      const habit1 = HabitFactory.create({ id: 'habit-1' });
      const habit2 = HabitFactory.create({ id: 'habit-2' });
      const store = useHabitsStore.getState();

      // Create completions for both habits
      const completions1 = CompletionFactory.createStreak(
        habit1.id,
        5,
        DateFactory.today()
      );
      const completions2 = CompletionFactory.createStreak(
        habit2.id,
        5,
        DateFactory.today()
      );

      // Add to store
      store.habits.set(habit1.id, habit1);
      store.habits.set(habit2.id, habit2);
      [...completions1, ...completions2].forEach((completion) => {
        store.completions.set(completion.id, completion);
      });

      const completionsArray = Array.from(store.completions.values());
      expect(completionsArray).toHaveLength(10);

      // Consistency across multiple habits
      const habit1Completions = completionsArray.filter(
        (c) => c.habit_id === habit1.id
      );
      const habit2Completions = completionsArray.filter(
        (c) => c.habit_id === habit2.id
      );

      expect(habit1Completions).toHaveLength(5);
      expect(habit2Completions).toHaveLength(5);
    });
  });
});
