import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import useHabitsStore from '@/habits-store/store';
import type { CompletionStatus } from '@/habits-store/types';
import Colors from '@/lib/constants/Colors';
import dayjs from '@/lib/utils/dayjs';
import { dateUtils } from '@/lib/utils/dayjs';
// import type { CompletionStatus\ }

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
  const { getMonthStatuses, currentStreak } = useHabitsStore();
  // Get current month stats
  const monthDate = dateUtils.fromUTC(selectedDate);
  const monthStatuses = getMonthStatuses(selectedDate);
  const daysInMonth = monthDate.daysInMonth();

  let completedDays = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = monthDate.date(i).format('YYYY-MM-DD');
    if (monthStatuses[dateStr] === 'all_completed') {
      completedDays++;
    }
  }
  const completionRate = Math.round((completedDays / daysInMonth) * 100);

  // Format current date for the Calendar component
  const currentDateStr = dayjs(selectedDate).format('YYYY-MM-DD');

  // Prepare marked dates
  const markedDates = Object.entries(monthStatuses).reduce(
    (
      acc: Record<string, any>,
      [dateStr, status]: [string, CompletionStatus]
    ) => {
      const currentDateStr = dateUtils.toServerDateString(selectedDate);
      let customStyles = {};

      switch (status) {
        case 'all_completed':
          customStyles = {
            container: {
              backgroundColor: Colors.shared.primary[500],
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
              borderColor: Colors.shared.primary[500],
              borderRadius: 16,
            },
          };
          break;
        case 'none_completed':
          // No special styling for uncompleted days
          break;
      }

      acc[dateStr] = {
        selected: currentDateStr === dateStr,
        selectedColor: Colors.shared.primary[100],
        customStyles,
      };
      return acc;
    },
    {}
  );

  // Handle date selection
  const handleDayPress = useCallback(
    (day: any) => {
      const selectedDate = dateUtils.fromServerDate(day.dateString);
      onSelectDate?.(selectedDate.toDate());
    },
    [onSelectDate]
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
        current={currentDateStr}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        enableSwipeMonths={true}
        style={styles.calendar}
        markingType="custom"
        theme={{
          backgroundColor: Colors.light.background.paper,
          calendarBackground: Colors.light.background.paper,
          textSectionTitleColor: Colors.light.text.secondary,
          selectedDayBackgroundColor: Colors.shared.primary[100],
          selectedDayTextColor: Colors.light.text.primary,
          todayTextColor: Colors.shared.primary[500],
          dayTextColor: Colors.light.text.primary,
          textDisabledColor: Colors.light.text.disabled,
          monthTextColor: Colors.light.text.primary,
          textMonthFontSize: 18,
          textMonthFontWeight: '600',
          arrowColor: Colors.light.text.primary,
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
    backgroundColor: Colors.light.background.paper,
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
    backgroundColor: Colors.shared.primary[50],
    borderWidth: 1,
    borderColor: Colors.shared.primary[100],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.shared.primary[700],
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.shared.primary[200],
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text.secondary,
    textTransform: 'uppercase',
  },
});

export default CalendarViewNew;
