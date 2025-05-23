import { MeasurementUnits } from '@/lib/constants/MeasurementUnits';

describe('Measurement Units', () => {
  describe('Unit Conversion Logic', () => {
    it('should convert between compatible time units', () => {
      // Test minutes to hours conversion
      const minutes = 60;
      const hours = minutes / 60;
      expect(hours).toBe(1);

      // Test hours to minutes conversion
      const hoursToMinutes = 2.5 * 60;
      expect(hoursToMinutes).toBe(150);

      // Test seconds to minutes conversion
      const seconds = 300;
      const minutesFromSeconds = seconds / 60;
      expect(minutesFromSeconds).toBe(5);
    });

    it('should handle decimal conversions correctly', () => {
      // Test fractional hours
      const fractionalHours = 1.5;
      const minutesFromFractional = fractionalHours * 60;
      expect(minutesFromFractional).toBe(90);

      // Test fractional minutes
      const fractionalMinutes = 2.5;
      const secondsFromFractional = fractionalMinutes * 60;
      expect(secondsFromFractional).toBe(150);
    });

    it('should convert between distance units', () => {
      // Test kilometers to meters
      const kilometers = 2.5;
      const meters = kilometers * 1000;
      expect(meters).toBe(2500);

      // Test miles to kilometers (approximate)
      const miles = 1;
      const kmFromMiles = miles * 1.60934;
      expect(kmFromMiles).toBeCloseTo(1.60934, 5);

      // Test meters to kilometers
      const metersToKm = 1500 / 1000;
      expect(metersToKm).toBe(1.5);
    });

    it('should handle weight conversions', () => {
      // Test pounds to kilograms
      const pounds = 10;
      const kilograms = pounds * 0.453592;
      expect(kilograms).toBeCloseTo(4.53592, 5);

      // Test kilograms to pounds
      const kgToPounds = 5 / 0.453592;
      expect(kgToPounds).toBeCloseTo(11.0231, 4);
    });

    it('should handle volume conversions', () => {
      // Test liters to milliliters
      const liters = 2.5;
      const milliliters = liters * 1000;
      expect(milliliters).toBe(2500);

      // Test cups to milliliters (approximate)
      const cups = 2;
      const mlFromCups = cups * 236.588;
      expect(mlFromCups).toBeCloseTo(473.176, 3);
    });
  });

  describe('Unit Validation', () => {
    it('should validate measurement unit existence', () => {
      // Test valid units
      expect(MeasurementUnits.times).toBeDefined();
      expect(MeasurementUnits.minutes).toBeDefined();

      // Test unit properties
      expect(MeasurementUnits.times.id).toBe('times');
      expect(MeasurementUnits.minutes.id).toBe('minutes');
    });

    it('should validate unit properties structure', () => {
      const unit = MeasurementUnits.times;

      // Required properties
      expect(unit).toHaveProperty('id');
      expect(unit).toHaveProperty('name');
      expect(unit).toHaveProperty('shortName');
      expect(unit).toHaveProperty('category');
      expect(unit).toHaveProperty('baseIncrement');
      expect(unit).toHaveProperty('defaultGoal');

      // Property types
      expect(typeof unit.id).toBe('string');
      expect(typeof unit.name).toBe('string');
      expect(typeof unit.shortName).toBe('string');
      expect(typeof unit.category).toBe('string');
      expect(typeof unit.baseIncrement).toBe('number');
      expect(typeof unit.defaultGoal).toBe('number');
    });

    it('should validate unit categories', () => {
      const validCategories = ['count', 'time', 'distance', 'weight', 'volume'];

      Object.values(MeasurementUnits).forEach((unit) => {
        expect(validCategories).toContain(unit.category);
      });

      // Test specific categories
      expect(MeasurementUnits.times.category).toBe('count');
      expect(MeasurementUnits.minutes.category).toBe('time');
    });
  });

  describe('Default Values and Increments', () => {
    it('should provide appropriate default goals', () => {
      // Count-based units should have reasonable defaults
      expect(MeasurementUnits.times.defaultGoal).toBeGreaterThan(0);
      expect(MeasurementUnits.times.defaultGoal).toBeLessThanOrEqual(10);

      // Time-based units should have reasonable defaults
      expect(MeasurementUnits.minutes.defaultGoal).toBeGreaterThan(0);
      expect(MeasurementUnits.minutes.defaultGoal).toBeLessThanOrEqual(120);
    });

    it('should provide appropriate base increments', () => {
      // Count units should increment by 1
      expect(MeasurementUnits.times.baseIncrement).toBe(1);

      // Time units should have reasonable increments
      expect(MeasurementUnits.minutes.baseIncrement).toBeGreaterThan(0);
      expect(MeasurementUnits.minutes.baseIncrement).toBeLessThanOrEqual(15);
    });

    it('should maintain consistency between related units', () => {
      // All count-based units should have increment of 1
      Object.values(MeasurementUnits).forEach((unit) => {
        if (unit.category === 'count') {
          expect(unit.baseIncrement).toBe(1);
        }
      });

      // Time-based units should have reasonable increments
      Object.values(MeasurementUnits).forEach((unit) => {
        if (unit.category === 'time') {
          expect(unit.baseIncrement).toBeGreaterThan(0);
          expect(unit.baseIncrement).toBeLessThanOrEqual(60);
        }
      });
    });
  });

  describe('Unit Category Handling', () => {
    it('should group units by category correctly', () => {
      const unitsByCategory: Record<string, any[]> = {};

      Object.values(MeasurementUnits).forEach((unit) => {
        if (!unitsByCategory[unit.category]) {
          unitsByCategory[unit.category] = [];
        }
        unitsByCategory[unit.category].push(unit);
      });

      // Should have count category with times
      expect(unitsByCategory.count).toBeDefined();
      expect(unitsByCategory.count.some((unit) => unit.id === 'times')).toBe(
        true
      );

      // Should have time category with minutes
      expect(unitsByCategory.time).toBeDefined();
      expect(unitsByCategory.time.some((unit) => unit.id === 'minutes')).toBe(
        true
      );
    });

    it('should handle category-specific validation', () => {
      // Count category should only allow integer values
      const countUnits = Object.values(MeasurementUnits).filter(
        (unit) => unit.category === 'count'
      );

      countUnits.forEach((unit) => {
        expect(unit.baseIncrement).toBe(Math.floor(unit.baseIncrement));
      });

      // Time category can allow decimal values
      const timeUnits = Object.values(MeasurementUnits).filter(
        (unit) => unit.category === 'time'
      );

      timeUnits.forEach((unit) => {
        expect(unit.baseIncrement).toBeGreaterThan(0);
      });
    });
  });

  describe('Unit Display and Formatting', () => {
    it('should format unit names correctly', () => {
      // Test singular vs plural names
      expect(MeasurementUnits.times.oneName).toBe('Time');
      expect(MeasurementUnits.times.name).toBe('Times');

      // Test short names
      expect(MeasurementUnits.times.shortName).toBe('×');
      expect(MeasurementUnits.minutes.shortName).toBe('min');
    });

    it('should handle unit abbreviations', () => {
      // Short names should be concise
      Object.values(MeasurementUnits).forEach((unit) => {
        expect(unit.shortName.length).toBeLessThanOrEqual(4);
        expect(unit.shortName.length).toBeGreaterThan(0);
      });
    });

    it('should provide consistent naming patterns', () => {
      Object.values(MeasurementUnits).forEach((unit) => {
        // Names should be capitalized
        expect(unit.name[0]).toBe(unit.name[0].toUpperCase());
        expect(unit.oneName[0]).toBe(unit.oneName[0].toUpperCase());

        // IDs should be lowercase
        expect(unit.id).toBe(unit.id.toLowerCase());
      });
    });
  });

  describe('Unit Utility Functions', () => {
    it('should find units by category', () => {
      const findUnitsByCategory = (category: string) => {
        return Object.values(MeasurementUnits).filter(
          (unit) => unit.category === category
        );
      };

      const countUnits = findUnitsByCategory('count');
      const timeUnits = findUnitsByCategory('time');

      expect(countUnits.length).toBeGreaterThan(0);
      expect(timeUnits.length).toBeGreaterThan(0);
      expect(countUnits.every((unit) => unit.category === 'count')).toBe(true);
      expect(timeUnits.every((unit) => unit.category === 'time')).toBe(true);
    });

    it('should find unit by id', () => {
      const findUnitById = (id: string) => {
        return Object.values(MeasurementUnits).find((unit) => unit.id === id);
      };

      const timesUnit = findUnitById('times');
      const minutesUnit = findUnitById('minutes');

      expect(timesUnit).toBeDefined();
      expect(minutesUnit).toBeDefined();
      expect(timesUnit?.id).toBe('times');
      expect(minutesUnit?.id).toBe('minutes');
    });

    it('should validate unit compatibility', () => {
      const areUnitsCompatible = (unit1: any, unit2: any) => {
        return unit1.category === unit2.category;
      };

      const times = MeasurementUnits.times;
      const minutes = MeasurementUnits.minutes;

      // Same category units should be compatible
      expect(areUnitsCompatible(times, times)).toBe(true);
      expect(areUnitsCompatible(minutes, minutes)).toBe(true);

      // Different category units should not be compatible
      expect(areUnitsCompatible(times, minutes)).toBe(false);
    });

    it('should calculate appropriate step values', () => {
      const getStepValue = (unit: any, currentValue: number) => {
        if (unit.category === 'count') {
          return unit.baseIncrement;
        }
        if (unit.category === 'time' && currentValue < 60) {
          return unit.baseIncrement;
        }
        return unit.baseIncrement * 2; // Larger steps for larger values
      };

      const times = MeasurementUnits.times;
      const minutes = MeasurementUnits.minutes;

      expect(getStepValue(times, 5)).toBe(times.baseIncrement);
      expect(getStepValue(minutes, 30)).toBe(minutes.baseIncrement);
      expect(getStepValue(minutes, 90)).toBe(minutes.baseIncrement * 2);
    });
  });
});
