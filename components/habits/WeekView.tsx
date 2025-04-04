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

  // Generate array of dates
  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    return dayjs().subtract(7, 'day').add(i, 'day');
  });

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
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.selectedText,
                  isToday && styles.todayText,
                ]}
              >
                {date.format('ddd')}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.selectedText,
                  isToday && styles.todayText,
                ]}
              >
                {date.format('D')}
              </Text>
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
    borderRadius: 12,
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  today: {
    backgroundColor: '#E5E5EA',
  },
  dayName: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  todayText: {
    color: '#007AFF',
  },
});
