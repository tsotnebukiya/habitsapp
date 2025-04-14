import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from '@/lib/utils/dayjs';
import { dateUtils } from '@/lib/utils/dayjs';
import DayCell from './DayCell';
import Colors from '@/lib/constants/Colors';
import { useHabitsStore } from '@/lib/stores/habits_store';
import { useAchievementsStore } from '@/lib/stores/achievements_store';

// Get screen width to ensure responsive sizing
const screenWidth = Dimensions.get('window').width;
const daySize = (screenWidth - 64) / 7; // 32px padding on each side

interface CalendarViewProps {
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type CompletionStatus =
  | 'no_habits'
  | 'all_completed'
  | 'some_completed'
  | 'none_completed';

interface DayCellData {
  date: Date;
  displayValue: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  completionStatus: CompletionStatus;
}

// Optimized cell component that only receives primitive values
const MemoizedDayCell = React.memo(
  function MemoizedDayCell({
    cellData,
    onSelect,
  }: {
    cellData: DayCellData;
    onSelect: (date: Date) => void;
  }) {
    return (
      <DayCell
        completionStatus={cellData.completionStatus}
        date={cellData.date}
        displayValue={cellData.displayValue}
        isCurrentMonth={cellData.isCurrentMonth}
        isToday={cellData.isToday}
        isSelected={cellData.isSelected}
        onSelect={onSelect}
      />
    );
  },
  (prevProps, nextProps) => {
    // Simplified comparison using primitive values
    const prev = prevProps.cellData;
    const next = nextProps.cellData;
    return (
      prev.isCurrentMonth === next.isCurrentMonth &&
      prev.isToday === next.isToday &&
      prev.isSelected === next.isSelected &&
      prev.completionStatus === next.completionStatus &&
      prev.displayValue === next.displayValue &&
      prev.date.getTime() === next.date.getTime() &&
      prevProps.onSelect === nextProps.onSelect
    );
  }
);

const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectDate,
  selectedDate = new Date(),
}) => {
  // Get the cached status calculator from the store
  const { getMonthStatusMap } = useHabitsStore();

  // State for the currently displayed month/year
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate));

  // State for the selected day
  const [selected, setSelected] = useState(dateUtils.normalize(selectedDate));

  // Get today's date for highlighting
  const today = useMemo(() => dateUtils.today(), []);

  // Get current streak
  const currentStreak = useAchievementsStore((state) => state.currentStreak);

  // Format the month/year for display
  const monthYearText = currentMonth.format('MMMM YYYY');

  // Get the cached status map for the current month
  const allHabitStatuses = useMemo(() => {
    const statusMap = getMonthStatusMap(currentMonth);
    return statusMap;
  }, [currentMonth, getMonthStatusMap]);

  // Generate the days for the current month's grid using optimized calculation
  const calendarDays = useMemo(() => {
    // Get first day of month as native Date
    const firstDay = currentMonth.startOf('month').toDate();
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days needed before the first day of month
    const daysBeforeMonth = firstDayOfWeek;

    // Calculate total days in month
    const daysInMonth = currentMonth.daysInMonth();

    // Calculate days needed after the month
    const lastDay = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      daysInMonth
    );
    const daysAfterMonth = 6 - lastDay.getDay();

    // Calculate total days needed
    const totalDays = daysBeforeMonth + daysInMonth + daysAfterMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    // Create weeks array directly with pre-calculated values
    const weeks: DayCellData[][] = Array(totalWeeks)
      .fill(null)
      .map(() => []);

    // Start date is first day of grid
    let currentDate = new Date(firstDay);
    currentDate.setDate(1 - daysBeforeMonth);

    const currentMonthValue = currentMonth.month();
    const todayTime = today.toDate().getTime();
    const selectedTime = selected.toDate().getTime();

    // Fill weeks array with pre-calculated cell data
    for (let week = 0; week < totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const dateString = dateUtils.toDateString(date);
        const status = allHabitStatuses.get(dateString);

        weeks[week][day] = {
          date,
          displayValue: date.getDate().toString(),
          isCurrentMonth: date.getMonth() === currentMonthValue,
          isToday: date.getTime() === todayTime,
          isSelected: date.getTime() === selectedTime,
          completionStatus: status?.completionStatus ?? 'no_habits',
        };

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return weeks;
  }, [currentMonth, allHabitStatuses, today, selected]);

  // Calculate month stats using pre-calculated values
  const monthStats = useMemo(() => {
    const totalDays = currentMonth.daysInMonth();
    let completedDays = 0;

    for (let i = 1; i <= totalDays; i++) {
      const date = currentMonth.date(i);
      const dateString = dateUtils.toDateString(date);
      const status = allHabitStatuses.get(dateString);
      if (status?.completionStatus === 'all_completed') {
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
  }, [currentMonth, allHabitStatuses]);

  // Handle month navigation
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  }, []);

  // Memoize the selection handler
  const handleSelectDay = useCallback(
    (date: Date) => {
      const selectedDay = dateUtils.normalize(dayjs(date));
      setSelected(selectedDay);
      onSelectDate?.(date);
    },
    [onSelectDate]
  );

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
      {/* <View style={styles.statsContainer}>
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
      </View> */}

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
            {week.map((cellData, dayIndex) => (
              <MemoizedDayCell
                key={`${weekIndex}-${dayIndex}`}
                cellData={cellData}
                onSelect={handleSelectDay}
              />
            ))}
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

export default React.memo(CalendarView);
