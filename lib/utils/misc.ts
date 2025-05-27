import dayjs, { dateUtils } from './dayjs';

export const isToday = (date: Date) => {
  const today = dateUtils.today();
  const targetDate = dayjs(date);
  return targetDate.isSame(today, 'day');
};

export const getRelativeDateText = (
  date: Date,
  t: (key: string, options?: any) => string
): string => {
  const today = dateUtils.today();
  const targetDate = dayjs(date);

  if (targetDate.isSame(today, 'day')) {
    return t('common.today');
  }

  if (targetDate.isSame(today.subtract(1, 'day'), 'day')) {
    return t('common.yesterday');
  }

  if (targetDate.isSame(today.add(1, 'day'), 'day')) {
    return t('common.tomorrow');
  }

  // Use translated month names instead of dayjs format
  const monthKey = targetDate.format('MMMM').toLowerCase();
  const translatedMonth = t(`months.${monthKey}`, {
    defaultValue: monthKey,
  });
  const day = targetDate.format('D');

  // If it's a different year, include the year
  if (!targetDate.isSame(today, 'year')) {
    const year = targetDate.format('YYYY');
    return `${day} ${translatedMonth} ${year}`;
  }

  return `${day} ${translatedMonth}`;
};
