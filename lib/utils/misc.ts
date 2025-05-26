import dayjs, { dateUtils } from './dayjs';
import i18n from './i18n';

export const isToday = (date: Date) => {
  const today = dateUtils.today();
  const targetDate = dayjs(date);
  return targetDate.isSame(today, 'day');
};

export const getRelativeDateText = (date: Date): string => {
  const today = dateUtils.today();
  const targetDate = dayjs(date);

  if (targetDate.isSame(today, 'day')) {
    return i18n.t('common.today');
  }

  if (targetDate.isSame(today.subtract(1, 'day'), 'day')) {
    return i18n.t('common.yesterday');
  }

  if (targetDate.isSame(today.add(1, 'day'), 'day')) {
    return i18n.t('common.tomorrow');
  }

  // If it's a different year, include the year
  if (!targetDate.isSame(today, 'year')) {
    return targetDate.format('D MMMM YYYY');
  }

  return targetDate.format('D MMMM');
};
