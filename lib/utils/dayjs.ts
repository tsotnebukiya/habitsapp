import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isToday from 'dayjs/plugin/isToday';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isoWeek);
// Set default timezone to local
dayjs.tz.setDefault(dayjs.tz.guess());

// Type for valid date inputs
export type DateInput = string | number | Date | dayjs.Dayjs;

// Core date utilities
export const dateUtils = {
  // UTC Conversion
  toUTC: (date: DateInput) => dayjs(date).utc(),
  fromUTC: (date: DateInput) => dayjs.utc(date).local(),

  // Timezone utilities
  getCurrentTimezone: () => dayjs.tz.guess(),

  // Server date formatting (always UTC)
  toServerDateString: (date: DateInput) =>
    dayjs(date).utc().format('YYYY-MM-DD'),
  toServerDateTime: (date: DateInput) => dayjs(date).utc().toISOString(),
  fromServerDate: (dateStr: string) => dayjs.utc(dateStr).local(),

  // Validation
  isValidDate: (date: DateInput) => dayjs(date).isValid(),
  isToday: (date: DateInput) => dayjs(date).isToday(),
  isFutureDate: (date: DateInput) => dayjs(date).isAfter(dayjs(), 'day'),
  isPastDate: (date: DateInput) => dayjs(date).isBefore(dayjs(), 'day'),

  // Normalization for comparison (always in UTC)
  normalize: (date: DateInput) => {
    // First ensure we're in UTC, then normalize to start of day
    const utcDate = dayjs.utc(date);
    return utcDate.startOf('day');
  },

  // Comparisons (always normalized and in UTC)
  isSameDay: (date1: DateInput, date2: DateInput) =>
    dateUtils.normalize(date1).isSame(dateUtils.normalize(date2)),
  isBeforeDay: (date1: DateInput, date2: DateInput) =>
    dateUtils.normalize(date1).isBefore(dateUtils.normalize(date2)),
  isAfterDay: (date1: DateInput, date2: DateInput) =>
    dateUtils.normalize(date1).isAfter(dateUtils.normalize(date2)),
  isBetweenDays: (date: DateInput, start: DateInput, end: DateInput) =>
    dateUtils
      .normalize(date)
      .isBetween(
        dateUtils.normalize(start),
        dateUtils.normalize(end),
        'day',
        '[]'
      ),

  // Formatting (always in local time for display)
  toDateString: (date: DateInput) => dayjs(date).format('YYYY-MM-DD'),
  toDisplayDate: (date: DateInput) => dayjs(date).format('MMMM D, YYYY'),
  toTimeString: (date: DateInput) => dayjs(date).format('HH:mm'),
  toFullDateTime: (date: DateInput) => dayjs(date).format('MMMM D, YYYY HH:mm'),

  // New utility: format as hh:mm (24-hour, zero-padded)
  toHHMMString: (date: DateInput) => dayjs(date).format('HH:mm'),

  // Common operations (preserving timezone)
  startOfDay: (date: DateInput) => dayjs(date).startOf('day'),
  endOfDay: (date: DateInput) => dayjs(date).endOf('day'),
  addDays: (date: DateInput, days: number) => dayjs(date).add(days, 'day'),
  subtractDays: (date: DateInput, days: number) =>
    dayjs(date).subtract(days, 'day'),
  getDayOfWeek: (date: DateInput) => dayjs(date).day(),

  // Current time
  today: () => dayjs().startOf('day'),
  now: () => dayjs(),
  todayUTC: () => dayjs().utc().startOf('day'),
  nowUTC: () => dayjs().utc(),

  // Date creation (always in local time)
  create: (year: number, month: number, day: number) =>
    dayjs().year(year).month(month).date(day).startOf('day'),

  // Date creation (UTC)
  createUTC: (year: number, month: number, day: number) =>
    dayjs.utc().year(year).month(month).date(day).startOf('day'),
};

export default dayjs;
