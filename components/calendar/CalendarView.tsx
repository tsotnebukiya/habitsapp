import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
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
import { useDayStatusStore } from '@/lib/stores/day_status_store';
// import { useCurrentStreak } from '@/lib/hooks/useAchievements';

// Get screen width to ensure responsive sizing
const screenWidth = Dimensions.get('window').width;
const daySize = (screenWidth - 64) / 7; // 32px padding on each side

interface CalendarViewProps {
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Pre-compute days in month for faster lookup
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Helper to get days in month considering leap years
const getDaysInMonth = (month: number, year: number) => {
  if (month === 1) {
    // February
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return DAYS_IN_MONTH[month];
};

const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectDate,
  selectedDate = new Date(),
}) => {
  const startTime = performance.now();
  console.log('Calendar render start');

  // For tracking render phases
  const renderPhaseRef = useRef({
    storeInit: 0,
    stateInit: 0,
    hookInit: 0,
    memoCalc: 0,
    renderPrep: 0,
    jsxCreation: 0,
    reactInternals: 0,
  });

  // Store initialization
  const storeInitStart = performance.now();
  const { getMonthStatuses, getDayStatus } = useDayStatusStore();
  const currentStreak = useAchievementsStore((state) => state.currentStreak);
  renderPhaseRef.current.storeInit = performance.now() - storeInitStart;
  console.log(
    'Store initialization took:',
    renderPhaseRef.current.storeInit,
    'ms'
  );

  // State initialization
  const stateInitStart = performance.now();
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate));
  const [selected, setSelected] = useState(dateUtils.normalize(selectedDate));
  renderPhaseRef.current.stateInit = performance.now() - stateInitStart;
  console.log(
    'State initialization took:',
    renderPhaseRef.current.stateInit,
    'ms'
  );

  // Hook initialization and calculations
  const hookInitStart = performance.now();
  const monthYearText = currentMonth.format('MMMM YYYY');
  const today = dateUtils.today();
  renderPhaseRef.current.hookInit = performance.now() - hookInitStart;
  console.log(
    'Hook initialization took:',
    renderPhaseRef.current.hookInit,
    'ms'
  );

  // Memoized calculations
  const memoStart = performance.now();

  // Get cached statuses for the current month
  const monthStatuses = useMemo(() => {
    const cacheStart = performance.now();
    const result = getMonthStatuses(currentMonth.toDate());
    console.log('getMonthStatuses took:', performance.now() - cacheStart, 'ms');
    return result;
  }, [currentMonth, getMonthStatuses]);

  // Generate the days for the current month's grid
  const calendarDays = useMemo(() => {
    const gridStart = performance.now();
    const year = currentMonth.year();
    const month = currentMonth.month();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = getDaysInMonth(month, year);

    // Calculate previous month info
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

    // Calculate next month info
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    // Pre-allocate days array with exact size needed
    const days = new Array(42); // 6 weeks * 7 days
    let dayIndex = 0;

    // Previous month's days
    const prevMonthStart = daysInPrevMonth - firstDayOfWeek + 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayOfMonth = prevMonthStart + i;
      days[dayIndex++] = dayjs(new Date(prevYear, prevMonth, dayOfMonth));
    }

    // Current month's days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days[dayIndex++] = dayjs(new Date(year, month, i));
    }

    // Next month's days
    for (let i = 1; dayIndex < 42; i++) {
      days[dayIndex++] = dayjs(new Date(nextYear, nextMonth, i));
    }

    // Group into weeks - using pre-sized array
    const weeks = new Array(6);
    for (let i = 0; i < 6; i++) {
      weeks[i] = days.slice(i * 7, (i + 1) * 7);
    }

    console.log(
      'Calendar grid generation took:',
      performance.now() - gridStart,
      'ms'
    );
    return weeks;
  }, [currentMonth]);

  // Get current month stats using cached statuses
  const monthStats = useMemo(() => {
    const statsStart = performance.now();
    const year = currentMonth.year();
    const month = currentMonth.month() + 1;
    const daysInMonth = getDaysInMonth(month - 1, year);

    let completedDays = 0;
    const monthStr = month < 10 ? `0${month}` : month.toString();
    const baseDate = `${year}-${monthStr}-`;

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = baseDate + (i < 10 ? `0${i}` : i);
      if (monthStatuses[dateStr]?.status === 'all_completed') {
        completedDays++;
      }
    }

    const completionRate = Math.round((completedDays / daysInMonth) * 100);
    console.log(
      'Month stats calculation took:',
      performance.now() - statsStart,
      'ms'
    );
    return {
      completedDays,
      totalDays: daysInMonth,
      completionRate,
    };
  }, [currentMonth, monthStatuses]);

  renderPhaseRef.current.memoCalc = performance.now() - memoStart;
  console.log(
    'Total memoized calculations took:',
    renderPhaseRef.current.memoCalc,
    'ms'
  );

  // Event handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  }, []);

  const handleSelectDay = useCallback(
    (date: Date) => {
      const selectedDay = dateUtils.normalize(date);
      setSelected(selectedDay);
      onSelectDate?.(date);
    },
    [onSelectDate]
  );

  const getDateCompletionStatus = useCallback(
    (date: dayjs.Dayjs) => {
      const cachedStatus = getDayStatus(date.toDate());
      return cachedStatus?.status || 'no_habits';
    },
    [getDayStatus]
  );

  // JSX Creation
  const jsxStart = performance.now();

  // Create week components
  const weekComponents = calendarDays.map((week, weekIndex) => (
    <View key={weekIndex} style={styles.week}>
      {week.map((day: dayjs.Dayjs) => {
        const isCurrentMonth = day.month() === currentMonth.month();
        const isToday = dateUtils.isSameDay(day, today);
        const isSelectedDay = dateUtils.isSameDay(day, selected);

        return (
          <DayCell
            key={day.format('YYYY-MM-DD')}
            date={day.toDate()}
            displayValue={day.format('D')}
            isCurrentMonth={isCurrentMonth}
            isToday={isToday}
            isSelected={isSelectedDay}
            completionStatus={getDateCompletionStatus(day)}
            onSelect={handleSelectDay}
          />
        );
      })}
    </View>
  ));

  renderPhaseRef.current.jsxCreation = performance.now() - jsxStart;
  console.log('JSX creation took:', renderPhaseRef.current.jsxCreation, 'ms');

  useEffect(() => {
    const totalTime = performance.now() - startTime;
    renderPhaseRef.current.reactInternals =
      totalTime -
      (renderPhaseRef.current.storeInit +
        renderPhaseRef.current.stateInit +
        renderPhaseRef.current.hookInit +
        renderPhaseRef.current.memoCalc +
        renderPhaseRef.current.jsxCreation);

    console.log('Performance breakdown:');
    console.log(
      '- Store initialization:',
      renderPhaseRef.current.storeInit,
      'ms'
    );
    console.log(
      '- State initialization:',
      renderPhaseRef.current.stateInit,
      'ms'
    );
    console.log(
      '- Hook initialization:',
      renderPhaseRef.current.hookInit,
      'ms'
    );
    console.log(
      '- Memoized calculations:',
      renderPhaseRef.current.memoCalc,
      'ms'
    );
    console.log('- JSX creation:', renderPhaseRef.current.jsxCreation, 'ms');
    console.log(
      '- React internals:',
      renderPhaseRef.current.reactInternals,
      'ms'
    );
    console.log('Total Calendar mount time:', totalTime, 'ms');
  }, []);

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
      <View style={styles.calendarGrid}>{weekComponents}</View>
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
  week: {
    flexDirection: 'row',
    height: daySize,
    marginBottom: 2,
  },
});

export default React.memo(CalendarView);
