import React, { useEffect, useRef, memo, useMemo } from 'react';
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
import { dateUtils } from '@/lib/utils/dayjs';
import type { CompletionStatus } from '@/lib/stores/habits/types';

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
  const selectedDayjs = dateUtils.fromUTC(selectedDate);
  const { getDayStatus } = useHabitsStore();

  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 14; i++) {
      result.push(dateUtils.todayUTC().subtract(7, 'day').add(i, 'day'));
    }
    return result;
  }, []);

  const todayIndex = dates.findIndex((date) =>
    date.isSame(dateUtils.todayUTC(), 'day')
  );

  useEffect(() => {
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
        {dates.map((date, index) => {
          const isSelected = date.isSame(selectedDayjs, 'day');
          const isToday = date.isSame(dateUtils.todayUTC(), 'day');
          const completionStatus = getDayStatus(date.toDate());
          return (
            <TouchableOpacity
              key={date.format('YYYY-MM-DD')}
              onPress={() => onDateSelect(date.toDate())}
              style={[
                styles.dayContainer,
                isSelected && styles.selectedDay,
                isToday && styles.today,
              ]}
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
  today: {
    backgroundColor: Colors.shared.primary[50],
  },
});
