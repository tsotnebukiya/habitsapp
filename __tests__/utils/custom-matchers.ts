import { Habit, HabitCompletion } from '@/lib/habit-store/types';
import dayjs from 'dayjs';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidHabit(): R;
      toBeValidCompletion(): R;
      toBeValidDateString(): R;
      toHaveStreakLength(expectedLength: number): R;
      toBeInDateRange(startDate: string, endDate: string): R;
    }
  }
}

// Use global expect if available
const expectGlobal = (global as any).expect || require('@jest/globals').expect;

expectGlobal.extend({
  toBeValidHabit(received: any) {
    const habit = received as Habit;

    const requiredFields = [
      'id',
      'name',
      'user_id',
      'start_date',
      'is_active',
      'frequency_type',
      'type',
      'color',
      'icon',
      'category_name',
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        habit[field as keyof Habit] === undefined ||
        habit[field as keyof Habit] === null
    );

    if (missingFields.length > 0) {
      return {
        message: () =>
          `Expected habit to have all required fields, but missing: ${missingFields.join(
            ', '
          )}`,
        pass: false,
      };
    }

    // Validate date format
    if (!dayjs(habit.start_date).isValid()) {
      return {
        message: () =>
          `Expected habit.start_date to be a valid date, but got: ${habit.start_date}`,
        pass: false,
      };
    }

    // Validate frequency type
    if (!['daily', 'weekly'].includes(habit.frequency_type)) {
      return {
        message: () =>
          `Expected habit.frequency_type to be 'daily' or 'weekly', but got: ${habit.frequency_type}`,
        pass: false,
      };
    }

    return {
      message: () => `Expected habit to be invalid`,
      pass: true,
    };
  },

  toBeValidCompletion(received: any) {
    const completion = received as HabitCompletion;

    const requiredFields = [
      'id',
      'habit_id',
      'completion_date',
      'value',
      'user_id',
      'status',
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        completion[field as keyof HabitCompletion] === undefined ||
        completion[field as keyof HabitCompletion] === null
    );

    if (missingFields.length > 0) {
      return {
        message: () =>
          `Expected completion to have all required fields, but missing: ${missingFields.join(
            ', '
          )}`,
        pass: false,
      };
    }

    // Validate date format
    if (!dayjs(completion.completion_date).isValid()) {
      return {
        message: () =>
          `Expected completion.completion_date to be a valid date, but got: ${completion.completion_date}`,
        pass: false,
      };
    }

    // Validate value is positive
    if (completion.value == null || completion.value <= 0) {
      return {
        message: () =>
          `Expected completion.value to be positive, but got: ${completion.value}`,
        pass: false,
      };
    }

    return {
      message: () => `Expected completion to be invalid`,
      pass: true,
    };
  },

  toBeValidDateString(received: string) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValidFormat = dateRegex.test(received);
    const isValidDate = dayjs(received).isValid();

    if (!isValidFormat) {
      return {
        message: () => `Expected "${received}" to match YYYY-MM-DD format`,
        pass: false,
      };
    }

    if (!isValidDate) {
      return {
        message: () => `Expected "${received}" to be a valid date`,
        pass: false,
      };
    }

    return {
      message: () => `Expected "${received}" to be an invalid date string`,
      pass: true,
    };
  },

  toHaveStreakLength(received: HabitCompletion[], expectedLength: number) {
    // Sort completions by date
    const sortedCompletions = received
      .slice()
      .sort((a, b) => dayjs(a.completion_date).diff(dayjs(b.completion_date)));

    if (sortedCompletions.length === 0) {
      return {
        message: () =>
          `Expected streak of length ${expectedLength}, but got empty array`,
        pass: expectedLength === 0,
      };
    }

    // Check for consecutive dates
    let streakLength = 1;
    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = dayjs(sortedCompletions[i - 1].completion_date);
      const currentDate = dayjs(sortedCompletions[i].completion_date);

      if (currentDate.diff(prevDate, 'day') === 1) {
        streakLength++;
      } else {
        break;
      }
    }

    return {
      message: () =>
        `Expected streak of length ${expectedLength}, but got ${streakLength}`,
      pass: streakLength === expectedLength,
    };
  },

  toBeInDateRange(received: string, startDate: string, endDate: string) {
    const date = dayjs(received);
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const isInRange =
      date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day');

    return {
      message: () =>
        `Expected "${received}" to be between "${startDate}" and "${endDate}"`,
      pass: isInRange,
    };
  },
});

export {};
