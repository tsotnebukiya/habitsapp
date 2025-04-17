import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import dayjs from 'dayjs';
import Colors from '@/lib/constants/Colors';
import useHabitsStore from '@/lib/stores/habits/store';
interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const DAY_WIDTH = 60;
const DAYS_TO_SHOW = 14; // Show 2 weeks
export const WeekView = memo(function WeekView({
  selectedDate,
  onDateSelect,
}: WeekViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedDayjs = dayjs(selectedDate);
  const { getDayStatus } = useHabitsStore();
  // Generate array of dates
  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    return dayjs().subtract(7, 'day').add(i, 'day');
  });

  const getDateCompletionStatus = (date: dayjs.Dayjs) => {
    // First try to get from cache
    const cachedStatus = getDayStatus(date.toDate());
    if (cachedStatus) {
      return cachedStatus.status;
    }
    // If not in cache, calculate it
    return 'none_completed';
  };

  useEffect(() => {
    const todayIndex = dates.findIndex((date) => date.isSame(dayjs(), 'day'));
    if (todayIndex !== -1 && scrollViewRef.current) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          x: todayIndex * DAY_WIDTH,
          animated: false,
        });
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
});

export default WeekView;

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: Colors.light.background.paper,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 8,
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
    backgroundColor: Colors.shared.primary[50],
    borderRadius: 12,
  },
  dayName: {
    fontSize: 13,
    color: Colors.light.text.secondary,
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
    borderColor: Colors.shared.primary[500],
  },
  numberBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  allCompletedNumber: {
    backgroundColor: Colors.shared.primary[500],
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  allCompletedText: {
    color: Colors.light.background.paper,
  },
  todayText: {
    color: Colors.shared.primary[500],
  },
});
