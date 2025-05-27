import { LocaleConfig } from 'react-native-calendars';
import i18n from './i18n';

export const configureCalendarLocale = (locale: string) => {
  // Configure calendar locale based on app language
  LocaleConfig.locales[locale] = {
    monthNames: [
      i18n.t('months.january'),
      i18n.t('months.february'),
      i18n.t('months.march'),
      i18n.t('months.april'),
      i18n.t('months.may'),
      i18n.t('months.june'),
      i18n.t('months.july'),
      i18n.t('months.august'),
      i18n.t('months.september'),
      i18n.t('months.october'),
      i18n.t('months.november'),
      i18n.t('months.december'),
    ],
    monthNamesShort: [
      i18n.t('months.jan'),
      i18n.t('months.feb'),
      i18n.t('months.mar'),
      i18n.t('months.apr'),
      i18n.t('months.may'),
      i18n.t('months.jun'),
      i18n.t('months.jul'),
      i18n.t('months.aug'),
      i18n.t('months.sep'),
      i18n.t('months.oct'),
      i18n.t('months.nov'),
      i18n.t('months.dec'),
    ],
    dayNames: [
      i18n.t('weekdays.long.sunday'),
      i18n.t('weekdays.long.monday'),
      i18n.t('weekdays.long.tuesday'),
      i18n.t('weekdays.long.wednesday'),
      i18n.t('weekdays.long.thursday'),
      i18n.t('weekdays.long.friday'),
      i18n.t('weekdays.long.saturday'),
    ],
    dayNamesShort: [
      i18n.t('weekdays.medium.sunday'),
      i18n.t('weekdays.medium.monday'),
      i18n.t('weekdays.medium.tuesday'),
      i18n.t('weekdays.medium.wednesday'),
      i18n.t('weekdays.medium.thursday'),
      i18n.t('weekdays.medium.friday'),
      i18n.t('weekdays.medium.saturday'),
    ],
    today: i18n.t('common.today'),
  };

  LocaleConfig.defaultLocale = locale;
};
