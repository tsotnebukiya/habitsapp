import { colors } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import type { CompletionStatus } from '@/lib/habit-store/types';
import { useCurrentStreak } from '@/lib/hooks/useAchievements';
import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
// Define DateObject type locally based on expected structure
interface DateObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

// Get screen width to ensure responsive sizing
const screenWidth = Dimensions.get('window').width;
const daySize = (screenWidth - 64) / 7; // 32px padding on each side

interface CalendarViewProps {
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
}

const CalendarViewNew: React.FC<CalendarViewProps> = ({
  onSelectDate,
  selectedDate = new Date(),
}) => {
  const { getMonthStatuses } = useHabitsStore();
  const currentStreak = useCurrentStreak();
  const [currentMonth, setCurrentMonth] = useState(
    dayjs(selectedDate).toDate()
  );

  const selectedDayjs = dayjs(selectedDate);
  const monthStatusesForSelected = getMonthStatuses(selectedDayjs.toDate());

  const daysInSelectedMonth = selectedDayjs.daysInMonth();
  let completedDays = 0;
  for (let i = 1; i <= daysInSelectedMonth; i++) {
    const dateStr = dateUtils.toServerDateString(selectedDayjs.date(i)); // Use UTC string
    if (monthStatusesForSelected[dateStr] === 'all_completed') {
      completedDays++;
    }
  }
  const completionRate = Math.round(
    (completedDays / daysInSelectedMonth) * 100
  );

  const targetMonth = dayjs(currentMonth);
  const prevMonthDate = targetMonth.subtract(1, 'month').toDate();
  const nextMonthDate = targetMonth.add(1, 'month').toDate();

  const monthStatusesForPrev = getMonthStatuses(prevMonthDate);
  const monthStatusesForCurrent = getMonthStatuses(currentMonth);
  const monthStatusesForNext = getMonthStatuses(nextMonthDate);

  const allStatusesForView = {
    ...monthStatusesForPrev,
    ...monthStatusesForCurrent,
    ...monthStatusesForNext,
  };

  const markedDates = Object.entries(allStatusesForView).reduce(
    (
      acc: Record<string, any>,
      [dateStr, status]: [string, CompletionStatus]
    ) => {
      // Use the passed selectedDate prop to determine the visual selection style
      const selectedDateStr = dateUtils.toServerDateString(selectedDate);
      let customStyles = {};

      switch (status) {
        case 'all_completed':
          customStyles = {
            container: {
              backgroundColor: colors.bgDark,
              borderRadius: 16,
            },
            text: {
              color: '#fff',
            },
          };
          break;
        case 'some_completed':
          customStyles = {
            container: {
              borderWidth: 1.5,
              borderColor: colors.bgDark,
              borderRadius: 16,
            },
          };
          break;
        case 'none_completed':
          // No special styling for uncompleted days
          break;
      }

      acc[dateStr] = {
        selected: selectedDateStr === dateStr,
        selectedColor: colors.bgDark,
        customStyles,
      };
      return acc;
    },
    {}
  );

  const handleDayPress = useCallback(
    (day: DateObject) => {
      const newSelectedDate = dateUtils.fromServerDate(day.dateString).toDate();
      onSelectDate?.(newSelectedDate);
    },
    [onSelectDate]
  );

  const handleMonthChange = useCallback(
    (month: DateObject) => {
      const newCurrentMonth = dayjs(month.dateString).toDate();
      setCurrentMonth(newCurrentMonth);

      const targetMonth = dayjs(newCurrentMonth);
      const prevMonth = targetMonth.subtract(1, 'month').toDate();
      const nextMonth = targetMonth.add(1, 'month').toDate();

      getMonthStatuses(prevMonth);
      getMonthStatuses(targetMonth.toDate());
      getMonthStatuses(nextMonth);
    },
    [getMonthStatuses]
  );

  return (
    <View style={styles.container}>
      {/* Month stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedDays}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        // Use currentMonth state to control the displayed month initially
        current={dayjs(currentMonth).format('YYYY-MM-DD')}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        enableSwipeMonths={true}
        style={styles.calendar}
        markingType="custom"
        theme={{
          backgroundColor: colors.bgDark,
          calendarBackground: colors.bgDark,
          textSectionTitleColor: colors.bgDark,
          selectedDayBackgroundColor: colors.bgDark,
          selectedDayTextColor: colors.bgDark,
          todayTextColor: colors.bgDark,
          dayTextColor: colors.bgDark,
          textDisabledColor: colors.bgDark,
          monthTextColor: colors.bgDark,
          textMonthFontSize: 18,
          textMonthFontWeight: '600',
          arrowColor: colors.bgDark,
          'stylesheet.calendar.header': {
            dayTextAtIndex0: styles.weekdayText,
            dayTextAtIndex1: styles.weekdayText,
            dayTextAtIndex2: styles.weekdayText,
            dayTextAtIndex3: styles.weekdayText,
            dayTextAtIndex4: styles.weekdayText,
            dayTextAtIndex5: styles.weekdayText,
            dayTextAtIndex6: styles.weekdayText,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgDark,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendar: {
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.bgDark,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.bgDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.bgDark,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.bgDark,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.bgDark,
    textTransform: 'uppercase',
  },
});

export default CalendarViewNew;
