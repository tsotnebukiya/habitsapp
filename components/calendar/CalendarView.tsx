import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from '@/lib/utils/dayjs';
import DayCell from './DayCell';
import Colors from '@/lib/constants/Colors';
import { useHabitsStore } from '@/lib/stores/habits_store';
import { useCurrentStreak } from '@/lib/hooks/useAchievements';

// Get screen width to ensure responsive sizing
const screenWidth = Dimensions.get('window').width;
const daySize = (screenWidth - 64) / 7; // 32px padding on each side

interface CalendarViewProps {
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectDate,
  selectedDate = new Date(),
}) => {
  const { getHabitsByDate, getHabitStatus, getCompletions } = useHabitsStore();
  // State for the currently displayed month/year
  const [currentMonth, setCurrentMonth] = useState(dayjs(selectedDate));

  // State for the selected day
  const [selected, setSelected] = useState(dayjs(selectedDate));

  // Get habit completions from store
  const completions = getCompletions();

  // Get current streak
  const currentStreak = useCurrentStreak();

  // Format the month/year for display
  const monthYearText = currentMonth.format('MMMM YYYY');

  // Get today's date for highlighting
  const today = dayjs().startOf('day');

  // Generate the days for the current month's grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = currentMonth.startOf('month');
    const lastDayOfMonth = currentMonth.endOf('month');

    // Find the first Sunday before or on the first day of the month
    let startDate = firstDayOfMonth.day(0);
    if (startDate.isAfter(firstDayOfMonth)) {
      startDate = startDate.subtract(7, 'day');
    }

    // Find the last Saturday after or on the last day of the month
    let endDate = lastDayOfMonth.day(6);
    if (endDate.isBefore(lastDayOfMonth)) {
      endDate = endDate.add(7, 'day');
    }

    // Create array of all days in the grid
    const days = [];
    let day = startDate;

    while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [currentMonth]);

  // Check if a date has a completion
  const hasCompletion = useCallback(
    (date: dayjs.Dayjs) => {
      const dateString = date.format('YYYY-MM-DD');

      // Check if any completions exist for this date
      const hasAnyCompletion = Array.from(completions.values()).some(
        (completion) => {
          const completionDate = dayjs(completion.completion_date).format(
            'YYYY-MM-DD'
          );
          return (
            completionDate === dateString &&
            (completion.status === 'completed' ||
              completion.status === 'skipped')
          );
        }
      );

      return hasAnyCompletion;
    },
    [completions]
  );

  // Check if date is part of a streak
  const isPartOfStreak = useCallback(
    (date: dayjs.Dayjs) => {
      if (!currentStreak || currentStreak <= 0) return false;

      // Get the range of dates for the current streak (today and days back equal to streak count)
      const streakEndDate = dayjs().startOf('day');
      const streakStartDate = streakEndDate.subtract(currentStreak - 1, 'day');

      // Check if the given date is within the streak range
      return (
        date.isSame(streakStartDate) ||
        (date.isAfter(streakStartDate) && date.isSame(streakEndDate)) ||
        date.isBefore(streakEndDate)
      );
    },
    [currentStreak]
  );

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  // Handle day selection
  const handleSelectDay = (date: Date) => {
    const selectedDay = dayjs(date);
    setSelected(selectedDay);
    onSelectDate?.(date);
  };

  // Get current month stats
  const monthStats = useMemo(() => {
    const totalDays = currentMonth.daysInMonth();
    let completedDays = 0;

    for (let i = 1; i <= totalDays; i++) {
      const date = currentMonth.date(i);
      if (hasCompletion(date)) {
        completedDays++;
      }
    }

    const completionRate =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      completedDays,
      totalDays,
      completionRate,
    };
  }, [currentMonth, hasCompletion]);
  const getDateCompletionStatus = (date: dayjs.Dayjs) => {
    const habits = getHabitsByDate(date);
    if (habits.length === 0) return 'no_habits';

    const completions = habits.map((habit) =>
      getHabitStatus(habit.id, date.toDate())
    );

    // Count skipped habits as "done" for the purpose of daily completion
    if (
      completions.every(
        (completion) =>
          completion?.status === 'completed' || completion?.status === 'skipped'
      )
    ) {
      return 'all_completed';
    }
    if (
      completions.some(
        (completion) =>
          completion?.status === 'completed' ||
          completion?.status === 'in_progress'
      )
    ) {
      return 'some_completed';
    }
    return 'none_completed';
  };
  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={Colors.light.text.primary}
          />
        </TouchableOpacity>

        <Text style={styles.monthYearText}>{monthYearText}</Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.light.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Month stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{monthStats.completedDays}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{monthStats.completionRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((day) => {
              const date = day.toDate();
              const isCurrentMonth = day.month() === currentMonth.month();
              const isToday = day.isSame(today, 'day');
              const isSelected = day.isSame(selected, 'day');
              const dayHasCompletion = hasCompletion(day);
              const partOfStreak = isPartOfStreak(day);
              if (day.startOf('day').format('YYYY-MM-DD') === '2025-04-12') {
                console.log(day.startOf('day'), 'checkday1');
              }
              const completionStatus = getDateCompletionStatus(day);
              return (
                <DayCell
                  completionStatus={completionStatus}
                  key={day.format('YYYY-MM-DD')}
                  date={date}
                  displayValue={day.format('D')}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  isSelected={isSelected}
                  // hasCompletion={dayHasCompletion}
                  // isStreak={partOfStreak}
                  onSelect={handleSelectDay}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background.paper,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: Colors.shared.neutral[100],
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text.primary,
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
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
    height: daySize,
    marginBottom: 2,
  },
});

export default CalendarView;
