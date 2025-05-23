import { dateUtils } from '@/lib/utils/dayjs';
import dayjs from 'dayjs';

// Mock timezone for consistent testing
const MOCK_TIMEZONE = 'Asia/Tbilisi'; // UTC+4

describe('dateUtils', () => {
  beforeAll(() => {
    // Set a consistent timezone for testing
    process.env.TZ = MOCK_TIMEZONE;
  });

  afterAll(() => {
    delete process.env.TZ;
  });

  describe('Local vs UTC date handling', () => {
    test('today() returns local date', () => {
      const today = dateUtils.today();
      const expectedLocal = dayjs().startOf('day');
      expect(today.format('YYYY-MM-DD')).toBe(
        expectedLocal.format('YYYY-MM-DD')
      );
    });

    test('todayUTC() returns UTC date', () => {
      const todayUTC = dateUtils.todayUTC();
      const expectedUTC = dayjs.utc().startOf('day');
      expect(todayUTC.format('YYYY-MM-DD')).toBe(
        expectedUTC.format('YYYY-MM-DD')
      );
    });

    test('normalizeLocal() vs normalize() produce different results in different timezones', () => {
      // Use a time that crosses timezone boundary: 22:00 UTC = 2:00 AM next day in Tbilisi
      const crossBoundaryDate = new Date('2025-05-22T22:00:00.000Z'); // 2:00 AM May 23 in Tbilisi

      const localNormalized = dateUtils.normalizeLocal(crossBoundaryDate);
      const utcNormalized = dateUtils.normalize(crossBoundaryDate);

      // In UTC+4 timezone, these should be different dates
      expect(localNormalized.format('YYYY-MM-DD')).toBe('2025-05-23'); // Local date
      expect(utcNormalized.format('YYYY-MM-DD')).toBe('2025-05-22'); // UTC date
      expect(localNormalized.format('YYYY-MM-DD')).not.toBe(
        utcNormalized.format('YYYY-MM-DD')
      );
    });

    test('toLocalDateString() vs toServerDateString() format correctly', () => {
      // Use a time that crosses timezone boundary
      const crossBoundaryDate = new Date('2025-05-22T22:00:00.000Z'); // 2:00 AM May 23 in Tbilisi

      const localString = dateUtils.toLocalDateString(crossBoundaryDate);
      const serverString = dateUtils.toServerDateString(crossBoundaryDate);

      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(serverString).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // In UTC+4, these should be different dates
      expect(localString).toBe('2025-05-23'); // Local date
      expect(serverString).toBe('2025-05-22'); // UTC date
      expect(localString).not.toBe(serverString);
    });
  });

  describe('Date comparison functions', () => {
    const date1 = new Date('2025-05-23T10:00:00.000Z');
    const date2 = new Date('2025-05-24T10:00:00.000Z');

    test('isSameDayLocal() compares dates in local timezone', () => {
      const sameDay = dateUtils.isSameDayLocal(date1, date1);
      const differentDay = dateUtils.isSameDayLocal(date1, date2);

      expect(sameDay).toBe(true);
      expect(differentDay).toBe(false);
    });

    test('isBeforeDayLocal() compares dates in local timezone', () => {
      const isBefore = dateUtils.isBeforeDayLocal(date1, date2);
      const isNotBefore = dateUtils.isBeforeDayLocal(date2, date1);

      expect(isBefore).toBe(true);
      expect(isNotBefore).toBe(false);
    });

    test('isAfterDayLocal() compares dates in local timezone', () => {
      const isAfter = dateUtils.isAfterDayLocal(date2, date1);
      const isNotAfter = dateUtils.isAfterDayLocal(date1, date2);

      expect(isAfter).toBe(true);
      expect(isNotAfter).toBe(false);
    });
  });

  describe('Edge cases', () => {
    test('handles daylight saving time transitions', () => {
      // Test dates around DST transition
      const beforeDST = new Date('2025-03-29T01:00:00.000Z'); // Before DST
      const afterDST = new Date('2025-03-30T01:00:00.000Z'); // After DST

      const beforeLocal = dateUtils.normalizeLocal(beforeDST);
      const afterLocal = dateUtils.normalizeLocal(afterDST);

      expect(beforeLocal.isValid()).toBe(true);
      expect(afterLocal.isValid()).toBe(true);
    });

    test('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');

      expect(() => dateUtils.normalizeLocal(invalidDate)).not.toThrow();
      expect(() => dateUtils.toLocalDateString(invalidDate)).not.toThrow();
    });
  });
});
