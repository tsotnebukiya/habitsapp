import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

// Set default timezone to local
dayjs.tz.setDefault(dayjs.tz.guess());

// Type for valid date inputs
export type DateInput = string | number | Date | dayjs.Dayjs;

// Core date utilities
export const dateUtils = {
  // Normalization for comparison
  normalize: (date: DateInput) => dayjs(date).startOf('day'),

  // Comparisons (always normalized)
  isSameDay: (date1: DateInput, date2: DateInput) =>
    dayjs(date1).startOf('day').isSame(dayjs(date2).startOf('day')),
  isBeforeDay: (date1: DateInput, date2: DateInput) =>
    dayjs(date1).startOf('day').isBefore(dayjs(date2).startOf('day')),
  isAfterDay: (date1: DateInput, date2: DateInput) =>
    dayjs(date1).startOf('day').isAfter(dayjs(date2).startOf('day')),
  isBetweenDays: (date: DateInput, start: DateInput, end: DateInput) =>
    dayjs(date)
      .startOf('day')
      .isBetween(
        dayjs(start).startOf('day'),
        dayjs(end).startOf('day'),
        'day',
        '[]'
      ),

  // Formatting
  toDateString: (date: DateInput) => dayjs(date).format('YYYY-MM-DD'),
  toDisplayDate: (date: DateInput) => dayjs(date).format('MMMM D, YYYY'),
  toTimeString: (date: DateInput) => dayjs(date).format('HH:mm'),

  // Common operations
  startOfDay: (date: DateInput) => dayjs(date).startOf('day'),
  endOfDay: (date: DateInput) => dayjs(date).endOf('day'),
  addDays: (date: DateInput, days: number) => dayjs(date).add(days, 'day'),
  subtractDays: (date: DateInput, days: number) =>
    dayjs(date).subtract(days, 'day'),
  getDayOfWeek: (date: DateInput) => dayjs(date).day(),

  // Current time
  today: () => dayjs().startOf('day'),
  now: () => dayjs(),

  // Date creation
  create: (year: number, month: number, day: number) =>
    dayjs().year(year).month(month).date(day).startOf('day'),
};

export default dayjs;
