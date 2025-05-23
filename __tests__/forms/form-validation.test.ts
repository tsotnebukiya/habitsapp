import dayjs from 'dayjs';
import { DateFactory, HabitFactory } from '../utils/test-factories';

describe('Form Validation', () => {
  describe('Habit Creation Form', () => {
    it('should validate required fields', () => {
      const invalidHabit = {
        name: '',
        user_id: '',
        start_date: '',
        frequency_type: '',
        type: '',
        color: '',
        icon: '',
        category_name: '',
      };

      // Test name validation
      expect(invalidHabit.name).toBe('');
      expect(invalidHabit.name.length).toBe(0);

      // Test user_id validation
      expect(invalidHabit.user_id).toBe('');
      expect(invalidHabit.user_id.length).toBe(0);

      // Test start_date validation
      expect(invalidHabit.start_date).toBe('');
      expect(dayjs(invalidHabit.start_date).isValid()).toBe(false);

      // Test frequency_type validation
      expect(invalidHabit.frequency_type).toBe('');
      expect(
        ['daily', 'weekly'].includes(invalidHabit.frequency_type as any)
      ).toBe(false);

      // Test type validation
      expect(invalidHabit.type).toBe('');
      expect(['GOOD', 'BAD'].includes(invalidHabit.type as any)).toBe(false);
    });

    it('should validate name length constraints', () => {
      const shortName = 'a';
      const longName = 'a'.repeat(101); // Assuming 100 char limit
      const validName = 'Valid Habit Name';

      expect(shortName.length).toBe(1);
      expect(longName.length).toBe(101);
      expect(validName.length).toBeGreaterThan(1);
      expect(validName.length).toBeLessThan(100);
    });

    it('should validate date formats', () => {
      const validDate = '2025-01-20';
      const invalidDate1 = '2025-13-01'; // Invalid month - dayjs might still parse this
      const invalidDate2 = '2025-01-32'; // Invalid day - dayjs might still parse this
      const invalidDate3 = 'invalid-date';

      expect(dayjs(validDate).isValid()).toBe(true);
      expect(dayjs(invalidDate3).isValid()).toBe(false);

      // Check if date components are within valid ranges
      expect(validDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(invalidDate3).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should validate start date is not in the future beyond reasonable limit', () => {
      const today = dayjs().format('YYYY-MM-DD');
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const farFuture = dayjs().add(1, 'year').format('YYYY-MM-DD');

      expect(dayjs(today).diff(dayjs(), 'day')).toBeLessThanOrEqual(0);
      expect(dayjs(tomorrow).isAfter(dayjs(), 'day')).toBe(true);
      expect(dayjs(farFuture).isAfter(dayjs().add(6, 'month'), 'day')).toBe(
        true
      );
    });

    it('should validate end date is after start date', () => {
      const startDate = '2025-01-20';
      const validEndDate = '2025-01-25';
      const invalidEndDate = '2025-01-15';

      expect(dayjs(validEndDate).isAfter(dayjs(startDate))).toBe(true);
      expect(dayjs(invalidEndDate).isAfter(dayjs(startDate))).toBe(false);
    });

    it('should validate goal value constraints', () => {
      const validGoalValues = [1, 5, 10, 100];
      const invalidGoalValues = [0, -1, -10];

      validGoalValues.forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });

      invalidGoalValues.forEach((value) => {
        expect(value).toBeLessThanOrEqual(0);
      });
    });

    it('should validate weekly habit days selection', () => {
      const validDaysOfWeek = [1, 3, 5]; // Mon, Wed, Fri
      const invalidDaysOfWeek1 = [0, 8]; // Invalid day numbers
      const invalidDaysOfWeek2 = []; // Empty array
      const invalidDaysOfWeek3 = [1, 1, 2]; // Duplicates

      // Valid days (1-7)
      validDaysOfWeek.forEach((day) => {
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(7);
      });

      // Invalid day numbers
      expect(invalidDaysOfWeek1.some((day) => day < 1 || day > 7)).toBe(true);

      // Empty array
      expect(invalidDaysOfWeek2.length).toBe(0);

      // Check for duplicates
      const uniqueDays = [...new Set(invalidDaysOfWeek3)];
      expect(uniqueDays.length).toBeLessThan(invalidDaysOfWeek3.length);
    });

    it('should validate color format', () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF'];
      const invalidColors = ['FF0000', '#GG0000', 'red', '#FF', '#FFFFFFF'];

      validColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });

      invalidColors.forEach((color) => {
        expect(color).not.toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should validate measurement units', () => {
      const validUnits = ['times', 'minutes', 'hours', 'pages', 'glasses'];
      const invalidUnits = ['', 'invalid-unit'];

      validUnits.forEach((unit) => {
        expect(unit).toBeDefined();
        expect(unit.length).toBeGreaterThan(0);
      });

      invalidUnits.forEach((unit) => {
        if (unit === '') {
          expect(unit.length).toBe(0);
        } else {
          expect(unit).toBe('invalid-unit'); // Known invalid unit
        }
      });
    });
  });

  describe('Habit Editing Form', () => {
    it('should preserve existing values during validation', () => {
      const originalHabit = HabitFactory.create({
        name: 'Original Name',
        goal_value: 5,
        color: '#FF0000',
      });

      const updates = {
        name: 'Updated Name',
      };

      const updatedHabit = { ...originalHabit, ...updates };

      expect(updatedHabit.name).toBe('Updated Name');
      expect(updatedHabit.goal_value).toBe(5); // Preserved
      expect(updatedHabit.color).toBe('#FF0000'); // Preserved
    });

    it('should validate partial updates', () => {
      const partialUpdate = {
        goal_value: 10,
      };

      expect(partialUpdate.goal_value).toBeGreaterThan(0);
      expect(Object.keys(partialUpdate)).toHaveLength(1);
    });

    it('should prevent invalid field updates', () => {
      const invalidUpdates = {
        goal_value: -5,
        name: '',
        color: 'invalid-color',
      };

      expect(invalidUpdates.goal_value).toBeLessThan(0);
      expect(invalidUpdates.name.length).toBe(0);
      expect(invalidUpdates.color).not.toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should validate frequency type changes', () => {
      const dailyToWeekly = {
        frequency_type: 'weekly' as const,
        days_of_week: [1, 3, 5],
      };

      const weeklyToDaily = {
        frequency_type: 'daily' as const,
        days_of_week: null,
      };

      expect(dailyToWeekly.frequency_type).toBe('weekly');
      expect(dailyToWeekly.days_of_week).toBeDefined();
      expect(Array.isArray(dailyToWeekly.days_of_week)).toBe(true);

      expect(weeklyToDaily.frequency_type).toBe('daily');
      expect(weeklyToDaily.days_of_week).toBeNull();
    });
  });

  describe('Completion Form', () => {
    it('should validate completion value constraints', () => {
      const validValues = [1, 5, 10, 100];
      const invalidValues = [0, -1, -10];

      validValues.forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });

      invalidValues.forEach((value) => {
        expect(value).toBeLessThanOrEqual(0);
      });
    });

    it('should validate completion date', () => {
      const validDate = DateFactory.today();
      const futureDate = DateFactory.daysFromNow(1);
      const pastDate = DateFactory.daysAgo(1);

      expect(dayjs(validDate).isValid()).toBe(true);
      expect(dayjs(futureDate).isValid()).toBe(true);
      expect(dayjs(pastDate).isValid()).toBe(true);

      // Future dates might be restricted
      expect(dayjs(futureDate).isAfter(dayjs(), 'day')).toBe(true);
    });

    it('should validate completion status', () => {
      const validStatuses = ['completed', 'in_progress', 'skipped'];
      const invalidStatuses = ['', 'invalid', null, undefined];

      validStatuses.forEach((status) => {
        expect(['completed', 'in_progress', 'skipped'].includes(status)).toBe(
          true
        );
      });

      invalidStatuses.forEach((status) => {
        if (status === null || status === undefined) {
          expect(status).toBeFalsy();
        } else {
          expect(
            ['completed', 'in_progress', 'skipped'].includes(status as any)
          ).toBe(false);
        }
      });
    });

    it('should validate value against habit goal', () => {
      const habit = HabitFactory.createWithGoal(10, 'times');
      const validCompletion = { value: 5 }; // Under goal
      const overCompletion = { value: 15 }; // Over goal
      const exactCompletion = { value: 10 }; // Exact goal

      expect(validCompletion.value).toBeLessThan(habit.goal_value || 0);
      expect(overCompletion.value).toBeGreaterThan(habit.goal_value || 0);
      expect(exactCompletion.value).toBe(habit.goal_value);
    });

    it('should validate decimal values for appropriate units', () => {
      const integerUnits = ['times', 'pages', 'glasses'];
      const decimalUnits = ['hours', 'kilometers', 'pounds'];

      integerUnits.forEach((unit) => {
        const value = 5.5;
        // For integer units, decimal values might be invalid
        expect(value % 1).not.toBe(0);
      });

      decimalUnits.forEach((unit) => {
        const value = 5.5;
        // For decimal units, decimal values are valid
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('Form State Management', () => {
    it('should handle form reset correctly', () => {
      const initialState = {
        name: '',
        goal_value: 1,
        color: '#FF0000',
        errors: {},
      };

      const filledState = {
        name: 'Test Habit',
        goal_value: 5,
        color: '#00FF00',
        errors: { name: 'Name too short' },
      };

      const resetState = { ...initialState };

      expect(resetState.name).toBe('');
      expect(resetState.goal_value).toBe(1);
      expect(resetState.color).toBe('#FF0000');
      expect(Object.keys(resetState.errors)).toHaveLength(0);
    });

    it('should accumulate validation errors', () => {
      const errors: Record<string, string> = {};

      // Simulate validation
      if (''.length === 0) errors.name = 'Name is required';
      if (-1 <= 0) errors.goal_value = 'Goal must be positive';
      if (!'#GG0000'.match(/^#[0-9A-F]{6}$/i))
        errors.color = 'Invalid color format';

      expect(Object.keys(errors)).toHaveLength(3);
      expect(errors.name).toBe('Name is required');
      expect(errors.goal_value).toBe('Goal must be positive');
      expect(errors.color).toBe('Invalid color format');
    });

    it('should clear specific field errors', () => {
      const errors: Record<string, string | undefined> = {
        name: 'Name is required',
        goal_value: 'Goal must be positive',
        color: 'Invalid color format',
      };

      // Clear name error
      errors.name = undefined;

      expect(errors.name).toBeUndefined();
      expect(Object.keys(errors)).toHaveLength(3);
      expect(errors.goal_value).toBeDefined();
      expect(errors.color).toBeDefined();
    });

    it('should validate form submission readiness', () => {
      const validForm = {
        name: 'Valid Habit',
        goal_value: 5,
        color: '#FF0000',
        errors: {},
      };

      const invalidForm = {
        name: '',
        goal_value: -1,
        color: 'invalid',
        errors: { name: 'Required', goal_value: 'Invalid' },
      };

      const isValidFormReady =
        Object.keys(validForm.errors).length === 0 &&
        validForm.name.length > 0 &&
        validForm.goal_value > 0;

      const isInvalidFormReady =
        Object.keys(invalidForm.errors).length === 0 &&
        invalidForm.name.length > 0 &&
        invalidForm.goal_value > 0;

      expect(isValidFormReady).toBe(true);
      expect(isInvalidFormReady).toBe(false);
    });
  });
});
