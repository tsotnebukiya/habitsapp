import useHabitsStore from '@/lib/habit-store/store';
import { Habit, HabitCompletion } from '@/lib/habit-store/types';
import { useHabitsForDate, useHabitStatusInfo } from '@/lib/hooks/useHabits';
import { renderHook } from '@testing-library/react-native';

// Mock the store
jest.mock('@/lib/habit-store/store');

const mockHabitsStore = useHabitsStore as jest.MockedFunction<
  typeof useHabitsStore
>;

describe('useHabits hooks', () => {
  const mockHabit: Habit = {
    id: 'test-habit-1',
    name: 'Test Habit',
    user_id: 'user-1',
    start_date: '2025-05-20',
    end_date: '2025-05-25',
    is_active: true,
    frequency_type: 'daily',
    goal_value: 2,
    goal_unit: 'times',
    completions_per_day: 2,
    type: 'GOOD',
    color: '#FF0000',
    icon: 'test-icon',
    category_name: 'Health',
    days_of_week: null,
    gamification_attributes: null,
    reminder_time: null,
    streak_goal: null,
    description: null,
    sort_id: 0,
    created_at: '2025-05-20T10:00:00Z',
    updated_at: '2025-05-20T10:00:00Z',
  };

  const weeklyHabit: Habit = {
    ...mockHabit,
    id: 'weekly-habit',
    frequency_type: 'weekly',
    days_of_week: [1, 3, 5], // Monday, Wednesday, Friday
    start_date: '2025-05-19', // Start on Monday
  };

  const mockCompletion: HabitCompletion = {
    id: 'completion-1',
    habit_id: 'test-habit-1',
    completion_date: '2025-05-23',
    value: 1,
    user_id: 'user-1',
    created_at: '2025-05-23T10:00:00Z',
    status: 'in_progress',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHabitsForDate', () => {
    test('returns habits active on the given date', () => {
      const habitsMap = new Map([['test-habit-1', mockHabit]]);

      mockHabitsStore.mockReturnValue(habitsMap);

      const { result } = renderHook(() =>
        useHabitsForDate(new Date('2025-05-23'))
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].id).toBe('test-habit-1');
    });

    test('excludes habits before start date', () => {
      const habitsMap = new Map([['test-habit-1', mockHabit]]);

      mockHabitsStore.mockReturnValue(habitsMap);

      const { result } = renderHook(
        () => useHabitsForDate(new Date('2025-05-19')) // Before start date
      );

      expect(result.current).toHaveLength(0);
    });

    test('excludes habits after end date', () => {
      const habitsMap = new Map([['test-habit-1', mockHabit]]);

      mockHabitsStore.mockReturnValue(habitsMap);

      const { result } = renderHook(
        () => useHabitsForDate(new Date('2025-05-26')) // After end date
      );

      expect(result.current).toHaveLength(0);
    });

    test('includes habits without end date', () => {
      const habitWithoutEnd = { ...mockHabit, end_date: null };
      const habitsMap = new Map([['test-habit-1', habitWithoutEnd]]);

      mockHabitsStore.mockReturnValue(habitsMap);

      const { result } = renderHook(
        () => useHabitsForDate(new Date('2025-06-01')) // Far future date
      );

      expect(result.current).toHaveLength(1);
    });

    test('respects weekly frequency patterns', () => {
      const habitsMap = new Map([['weekly-habit', weeklyHabit]]);

      mockHabitsStore.mockReturnValue(habitsMap);

      // Test Monday (day 1) - should be included
      const { result: mondayResult } = renderHook(
        () => useHabitsForDate(new Date('2025-05-19')) // Monday
      );
      expect(mondayResult.current).toHaveLength(1);

      // Test Tuesday (day 2) - should be excluded
      const { result: tuesdayResult } = renderHook(
        () => useHabitsForDate(new Date('2025-05-20')) // Tuesday
      );
      expect(tuesdayResult.current).toHaveLength(0);

      // Test Wednesday (day 3) - should be included
      const { result: wednesdayResult } = renderHook(
        () => useHabitsForDate(new Date('2025-05-21')) // Wednesday
      );
      expect(wednesdayResult.current).toHaveLength(1);
    });

    test('excludes inactive habits', () => {
      const inactiveHabit = { ...mockHabit, is_active: false };
      const habitsMap = new Map([['test-habit-1', inactiveHabit]]);

      mockHabitsStore.mockReturnValue(habitsMap);

      const { result } = renderHook(() =>
        useHabitsForDate(new Date('2025-05-23'))
      );

      expect(result.current).toHaveLength(0);
    });
  });

  describe('useHabitStatusInfo', () => {
    test('returns habit status information', () => {
      const habitsMap = new Map([['test-habit-1', mockHabit]]);
      const completionsMap = new Map([['completion-1', mockCompletion]]);

      mockHabitsStore
        .mockReturnValueOnce(habitsMap)
        .mockReturnValueOnce(completionsMap);

      const { result } = renderHook(() =>
        useHabitStatusInfo('test-habit-1', new Date('2025-05-23'))
      );

      expect(result.current.completion).toBeTruthy();
      expect(result.current.currentValue).toBe(1);
      expect(result.current.progress).toBe(0.5); // 1 out of 2
      expect(result.current.progressText).toBe('1/2 times');
    });

    test('handles non-existent habit', () => {
      const habitsMap = new Map();
      const completionsMap = new Map();

      mockHabitsStore
        .mockReturnValueOnce(habitsMap)
        .mockReturnValueOnce(completionsMap);

      const { result } = renderHook(() =>
        useHabitStatusInfo('non-existent', new Date('2025-05-23'))
      );

      expect(result.current.completion).toBeNull();
      expect(result.current.currentValue).toBe(0);
      expect(result.current.progress).toBe(0);
      expect(result.current.progressText).toBe('');
    });

    test('handles date with no completion', () => {
      const habitsMap = new Map([['test-habit-1', mockHabit]]);
      const completionsMap = new Map();

      mockHabitsStore
        .mockReturnValueOnce(habitsMap)
        .mockReturnValueOnce(completionsMap);

      const { result } = renderHook(() =>
        useHabitStatusInfo('test-habit-1', new Date('2025-05-22'))
      );

      expect(result.current.completion).toBeNull();
      expect(result.current.currentValue).toBe(0);
      expect(result.current.progress).toBe(0);
      expect(result.current.progressText).toBe('0/2 times');
    });
  });
});
