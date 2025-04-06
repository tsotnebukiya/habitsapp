import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import dayjs from 'dayjs';
import { useHabitsStore } from '../../lib/interfaces/habits_store';
import Colors from '../../lib/constants/Colors';

interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const DAY_WIDTH = 60;
const DAYS_TO_SHOW = 14; // Show 2 weeks

export default function WeekView({
  selectedDate,
  onDateSelect,
}: WeekViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedDayjs = dayjs(selectedDate);
  const { getHabitsByDate, getHabitStatus } = useHabitsStore();

  // Generate array of dates
  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    return dayjs().subtract(7, 'day').add(i, 'day');
  });

  // Get completion status for a date
  const getDateCompletionStatus = (date: dayjs.Dayjs) => {
    const habits = getHabitsByDate(date.toDate());
    if (habits.length === 0) return 'no_habits';

    const statuses = habits.map((habit) =>
      getHabitStatus(habit.id, date.toDate())
    );

    if (statuses.every((status) => status === 'completed')) {
      return 'all_completed';
    }
    if (
      statuses.some(
        (status) => status === 'completed' || status === 'in_progress'
      )
    ) {
      return 'some_completed';
    }
    return 'none_completed';
  };

  // Scroll to today on mount
  useEffect(() => {
    const todayIndex = dates.findIndex((date) => date.isSame(dayjs(), 'day'));
    if (todayIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: todayIndex * DAY_WIDTH,
        animated: false,
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date) => {
          const isSelected = date.isSame(selectedDayjs, 'day');
          const isToday = date.isSame(dayjs(), 'day');
          const completionStatus = getDateCompletionStatus(date);

          return (
            <TouchableOpacity
              key={date.format('YYYY-MM-DD')}
              onPress={() => onDateSelect(date.toDate())}
              style={[styles.dayContainer, isSelected && styles.selectedDay]}
            >
              <Text style={[styles.dayName, isToday && styles.todayText]}>
                {date.format('ddd')}
              </Text>

              <View
                style={[
                  styles.numberContainer,
                  completionStatus === 'some_completed' &&
                    styles.someCompletedNumber,
                ]}
              >
                <View
                  style={[
                    styles.numberBackground,
                    completionStatus === 'all_completed' &&
                      styles.allCompletedNumber,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && styles.todayText,
                      completionStatus === 'all_completed' &&
                        styles.allCompletedText,
                    ]}
                  >
                    {date.format('D')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  dayContainer: {
    width: DAY_WIDTH,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedDay: {
    backgroundColor: '#E3F2FF',
    borderRadius: 12,
  },
  dayName: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  numberContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  someCompletedNumber: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  numberBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  allCompletedNumber: {
    backgroundColor: '#007AFF',
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  allCompletedText: {
    color: '#fff',
  },
  todayText: {
    color: '#007AFF',
  },
});
