import { colors } from '@/lib/constants/ui';
import { useThreeMonthsStatuses } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AnimatedDayComponent from './AnimatedDay';
import { theme } from './theme';

interface DateObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface CalendarViewProps {}

const CalendarViewNew: React.FC<CalendarViewProps> = () => {
  const { currentLanguage } = useTranslation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(dayjs(today).toDate());

  const allStatusesForView = useThreeMonthsStatuses(currentMonth);

  const selectedDayjs = dayjs(today);

  // Calculate completed days directly from allStatusesForView
  const daysInSelectedMonth = selectedDayjs.daysInMonth();
  let completedDays = 0;
  for (let i = 1; i <= daysInSelectedMonth; i++) {
    const dateStr = dateUtils.toLocalDateString(selectedDayjs.date(i));
    if (allStatusesForView[dateStr] === 2) {
      // 2 = all_completed
      completedDays++;
    }
  }

  const markedDates = Object.entries(allStatusesForView).reduce(
    (acc: Record<string, any>, [dateStr, progress]: [string, number]) => {
      const selectedDateStr = dateUtils.toLocalDateString(today);
      acc[dateStr] = {
        selected: selectedDateStr === dateStr,
        progress,
      };
      return acc;
    },
    {}
  );

  const handleMonthChange = useCallback((month: DateObject) => {
    const newCurrentMonth = dayjs(month.dateString).toDate();
    setCurrentMonth(newCurrentMonth);
  }, []);

  return (
    <Calendar
      key={currentLanguage}
      current={dayjs(currentMonth).format('YYYY-MM-DD')}
      onMonthChange={handleMonthChange}
      markedDates={markedDates}
      enableSwipeMonths={true}
      hideExtraDays={true}
      firstDay={1}
      style={styles.container}
      markingType="custom"
      disabledByWeekDays={[0, 6]}
      dayComponent={AnimatedDayComponent}
      theme={theme}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    ...colors.dropShadow,
    paddingHorizontal: 12,
    paddingBottom: 20,
    backgroundColor: 'white',
    marginBottom: 30,
  },
});

export default CalendarViewNew;
