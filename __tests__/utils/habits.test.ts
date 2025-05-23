import { Habit, HabitCompletion } from '@/lib/habit-store/types';
import {
  calculateDateStatus,
  getCurrentProgress,
  getHabitStatus,
  getProgressText,
  normalizeDate,
} from '@/lib/utils/habits';

describe('Habit Utils', () => {
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

  const mockCompletions: HabitCompletion[] = [
    {
      id: 'completion-1',
      habit_id: 'test-habit-1',
      completion_date: '2025-05-23',
      value: 1,
      user_id: 'user-1',
      created_at: '2025-05-23T10:00:00Z',
      status: 'in_progress',
    },
    {
      id: 'completion-2',
      habit_id: 'test-habit-1',
      completion_date: '2025-05-24',
      value: 2,
      user_id: 'user-1',
      created_at: '2025-05-24T10:00:00Z',
      status: 'completed',
    },
  ];

  describe('getHabitStatus', () => {
    test('finds completion for exact date match using local time', () => {
      const testDate = new Date('2025-05-23T15:00:00.000Z');
      const completion = getHabitStatus(
        mockCompletions,
        'test-habit-1',
        testDate
      );

      expect(completion).toBeTruthy();
      expect(completion?.id).toBe('completion-1');
      expect(completion?.value).toBe(1);
    });

    test('returns null when no completion found', () => {
      const testDate = new Date('2025-05-22T15:00:00.000Z');
      const completion = getHabitStatus(
        mockCompletions,
        'test-habit-1',
        testDate
      );

      expect(completion).toBeNull();
    });

    test('returns null for non-existent habit', () => {
      const testDate = new Date('2025-05-23T15:00:00.000Z');
      const completion = getHabitStatus(
        mockCompletions,
        'non-existent',
        testDate
      );

      expect(completion).toBeNull();
    });
  });

  describe('calculateDateStatus', () => {
    test('calculates status for a specific date', () => {
      const testDate = new Date('2025-05-23');

      const status = calculateDateStatus(
        [mockHabit],
        mockCompletions,
        testDate
      );

      // Should return a number between 0 and 1
      expect(typeof status).toBe('number');
      expect(status).toBeGreaterThanOrEqual(0);
      expect(status).toBeLessThanOrEqual(1);
    });

    test('returns 0 for dates with no active habits', () => {
      const testDate = new Date('2025-05-15'); // Before habit start

      const status = calculateDateStatus(
        [mockHabit],
        mockCompletions,
        testDate
      );

      expect(status).toBe(0);
    });

    test('handles empty habits array', () => {
      const testDate = new Date('2025-05-23');

      const status = calculateDateStatus([], mockCompletions, testDate);

      expect(status).toBe(0);
    });
  });

  describe('normalizeDate', () => {
    test('normalizes date to local timezone date string', () => {
      const inputDate = new Date('2025-05-23T15:30:00.000Z');
      const normalized = normalizeDate(inputDate);

      expect(typeof normalized).toBe('string');
      expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('handles string input', () => {
      const inputDate = '2025-05-23';
      const normalized = normalizeDate(inputDate);

      expect(normalized).toBe('2025-05-23');
    });
  });

  describe('getCurrentProgress', () => {
    test('calculates progress percentage correctly', () => {
      const progress = getCurrentProgress(mockHabit, 1);
      expect(progress).toBe(0.5); // 1 out of 2 = 0.5 (50%)
    });

    test('caps progress at 1.0', () => {
      const progress = getCurrentProgress(mockHabit, 5);
      expect(progress).toBe(1.0); // Should not exceed 1.0
    });

    test('handles zero values', () => {
      const progress = getCurrentProgress(mockHabit, 0);
      expect(progress).toBe(0);
    });
  });

  describe('getProgressText', () => {
    test('formats progress text correctly', () => {
      const text = getProgressText(mockHabit, 1);
      expect(text).toBe('1/2 times');
    });

    test('handles different units', () => {
      const habitWithMinutes = {
        ...mockHabit,
        goal_unit: 'minutes',
        goal_value: 30,
      };

      const text = getProgressText(habitWithMinutes, 15);
      expect(text).toBe('15/30 minutes');
    });

    test('handles habits without goal_value', () => {
      const simpleHabit = {
        ...mockHabit,
        goal_value: null,
        goal_unit: null,
        completions_per_day: 1,
      };

      const text = getProgressText(simpleHabit, 1);
      expect(text).toBe('1/1');
    });
  });
});
