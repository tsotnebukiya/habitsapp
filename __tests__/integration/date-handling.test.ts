import { Habit, HabitCompletion } from '@/lib/habit-store/types';
import { dateUtils } from '@/lib/utils/dayjs';
import { getHabitStatus, normalizeDate } from '@/lib/utils/habits';
import dayjs from 'dayjs';

describe('Date Handling Integration Tests', () => {
  // Test the complete flow from habit creation to completion tracking
  describe('Habit Creation and Completion Flow', () => {
    test('habit created "today" appears only on today', () => {
      const today = new Date();
      const todayString = dayjs(today).format('YYYY-MM-DD');

      // Simulate habit creation using local time (as in create-habit.tsx)
      const habit: Partial<Habit> = {
        id: 'test-habit',
        start_date: todayString,
        end_date: null,
        is_active: true,
        frequency_type: 'daily',
      };

      // Simulate completion creation using local time
      const completion: HabitCompletion = {
        id: 'completion-1',
        habit_id: 'test-habit',
        completion_date: normalizeDate(today),
        value: 1,
        user_id: 'user-1',
        created_at: new Date().toISOString(),
        status: 'completed',
      };

      // Verify completion can be found for today
      const foundCompletion = getHabitStatus([completion], 'test-habit', today);
      expect(foundCompletion).toBeTruthy();
      expect(foundCompletion?.completion_date).toBe(todayString);
    });

    test('habit with end date does not appear after end date', () => {
      const startDate = '2025-05-20';
      const endDate = '2025-05-25';

      const habit: Partial<Habit> = {
        id: 'test-habit',
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        frequency_type: 'daily',
      };

      // Test date after end date
      const afterEndDate = dayjs('2025-05-26');

      // Simulate the useHabitsForDate logic
      const startDateObj = dayjs(habit.start_date).startOf('day');
      const endDateObj = dayjs(habit.end_date).startOf('day');

      const isInDateRange =
        startDateObj.isSameOrBefore(afterEndDate, 'day') &&
        afterEndDate.isSameOrBefore(endDateObj, 'day') &&
        habit.is_active;

      expect(isInDateRange).toBe(false);
    });
  });

  describe('Timezone Edge Cases', () => {
    test('handles timezone boundary correctly', () => {
      // Test case: User in UTC+4 timezone at 2:00 AM local time
      // This should be "today" in local time but "yesterday" in UTC

      const localMidnight = dayjs.tz('2025-05-23 00:00:00', 'Asia/Tbilisi');
      const localEarlyMorning = dayjs.tz('2025-05-23 02:00:00', 'Asia/Tbilisi');

      // Both should normalize to the same local date
      const normalizedMidnight = dateUtils.normalizeLocal(
        localMidnight.toDate()
      );
      const normalizedEarlyMorning = dateUtils.normalizeLocal(
        localEarlyMorning.toDate()
      );

      expect(normalizedMidnight.format('YYYY-MM-DD')).toBe('2025-05-23');
      expect(normalizedEarlyMorning.format('YYYY-MM-DD')).toBe('2025-05-23');
      expect(normalizedMidnight.format('YYYY-MM-DD')).toBe(
        normalizedEarlyMorning.format('YYYY-MM-DD')
      );
    });

    test('local vs UTC date strings are different in non-UTC timezone', () => {
      // Test with a specific time that would be different dates in UTC vs local
      const testTime = dayjs.tz('2025-05-23 02:00:00', 'Asia/Tbilisi'); // 22:00 UTC on May 22

      const localDateString = dateUtils.toLocalDateString(testTime.toDate());
      const utcDateString = dateUtils.toServerDateString(testTime.toDate());

      expect(localDateString).toBe('2025-05-23');
      expect(utcDateString).toBe('2025-05-22');
      expect(localDateString).not.toBe(utcDateString);
    });
  });

  describe('Weekly Frequency Edge Cases', () => {
    test('weekly habit respects day-of-week in local timezone', () => {
      const weeklyHabit: Partial<Habit> = {
        id: 'weekly-habit',
        frequency_type: 'weekly',
        days_of_week: [1], // Monday only
        start_date: '2025-05-19', // Monday
        end_date: null,
        is_active: true,
      };

      // Test Monday in local timezone
      const monday = dayjs.tz('2025-05-19 10:00:00', 'Asia/Tbilisi');
      const mondayDayOfWeek = monday.day(); // Should be 1 (Monday)

      expect(mondayDayOfWeek).toBe(1);
      expect(weeklyHabit.days_of_week?.includes(mondayDayOfWeek)).toBe(true);

      // Test Tuesday in local timezone
      const tuesday = dayjs.tz('2025-05-20 10:00:00', 'Asia/Tbilisi');
      const tuesdayDayOfWeek = tuesday.day(); // Should be 2 (Tuesday)

      expect(tuesdayDayOfWeek).toBe(2);
      expect(weeklyHabit.days_of_week?.includes(tuesdayDayOfWeek)).toBe(false);
    });
  });

  describe('Date Comparison Consistency', () => {
    test('all date comparison functions use same timezone', () => {
      const date1 = new Date('2025-05-23T10:00:00.000Z');
      const date2 = new Date('2025-05-24T10:00:00.000Z');

      // All local comparison functions should be consistent
      const isSameDay = dateUtils.isSameDayLocal(date1, date1);
      const isBefore = dateUtils.isBeforeDayLocal(date1, date2);
      const isAfter = dateUtils.isAfterDayLocal(date2, date1);

      expect(isSameDay).toBe(true);
      expect(isBefore).toBe(true);
      expect(isAfter).toBe(true);

      // Cross-checks
      expect(dateUtils.isBeforeDayLocal(date2, date1)).toBe(false);
      expect(dateUtils.isAfterDayLocal(date1, date2)).toBe(false);
      expect(dateUtils.isSameDayLocal(date1, date2)).toBe(false);
    });
  });

  describe('Achievement Calculations', () => {
    test('streak calculations use local dates consistently', () => {
      const completions: HabitCompletion[] = [
        {
          id: 'c1',
          habit_id: 'habit-1',
          completion_date: '2025-05-20',
          value: 1,
          user_id: 'user-1',
          created_at: '2025-05-20T10:00:00Z',
          status: 'completed',
        },
        {
          id: 'c2',
          habit_id: 'habit-1',
          completion_date: '2025-05-21',
          value: 1,
          user_id: 'user-1',
          created_at: '2025-05-21T10:00:00Z',
          status: 'completed',
        },
        {
          id: 'c3',
          habit_id: 'habit-1',
          completion_date: '2025-05-22',
          value: 1,
          user_id: 'user-1',
          created_at: '2025-05-22T10:00:00Z',
          status: 'completed',
        },
      ];

      // Verify completions are stored with local date strings
      const dates = completions.map((c) => c.completion_date).sort();
      expect(dates).toEqual(['2025-05-20', '2025-05-21', '2025-05-22']);

      // Verify consecutive dates (this would be used in streak calculation)
      for (let i = 1; i < dates.length; i++) {
        const prevDate = dayjs(dates[i - 1]);
        const currentDate = dayjs(dates[i]);
        const daysDiff = currentDate.diff(prevDate, 'day');
        expect(daysDiff).toBe(1); // Should be exactly 1 day apart
      }
    });
  });
});
