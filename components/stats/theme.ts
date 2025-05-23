import { fontWeights } from '@/lib/constants/ui';
import { Theme } from 'react-native-calendars/src/types';

export const theme = {
  // Month
  textMonthFontSize: 14,
  textMonthFontFamily: fontWeights.semibold,
  monthTextColor: '#282B35',

  // Arrow
  arrowColor: '#61667A',

  // Stylesheet
  'stylesheet.calendar.main': {
    week: {
      marginTop: 3,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
  'stylesheet.calendar.header': {
    week: {
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      flexDirection: 'row',
      height: 32,
      alignItems: 'center',
      marginBottom: 5,
    },
    dayHeader: {
      fontSize: 12,
      fontFamily: fontWeights.semibold,
      color: '#B6B9C8',
      width: 36,
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      display: 'flex',
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#EEEFF3',
      paddingVertical: 15,
    },
  },
} as Theme;
