import useHabitsStore from '@/lib/habit-store/store';
import { dateUtils } from '@/lib/utils/dayjs';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const flatListRef = useRef<FlatList<any>>(null);
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
    if (todayIndex !== -1 && flatListRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: todayIndex * DAY_WIDTH,
          animated: false,
        });
      });
    }
  }, [todayIndex]);

  const renderDateItem = ({ item: date }: { item: any }) => {
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
            completionStatus === 'some_completed' && styles.someCompletedNumber,
          ]}
        >
          <View
            style={[
              styles.numberBackground,
              completionStatus === 'all_completed' && styles.allCompletedNumber,
            ]}
          >
            <Text
              style={[
                styles.dayNumber,
                isToday && styles.todayText,
                completionStatus === 'all_completed' && styles.allCompletedText,
              ]}
            >
              {date.format('D')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any) => item.format('YYYY-MM-DD');

  const getItemLayout = (data: any, index: number) => ({
    length: DAY_WIDTH,
    offset: DAY_WIDTH * index,
    index,
  });

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={DAYS_TO_SHOW}
        windowSize={DAYS_TO_SHOW + 6}
      />
    </View>
  );
});

export default WeekView;

const styles = StyleSheet.create({
  container: {
    height: 80,
    // backgroundColor: Colors.bgDark,
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
    // backgroundColor: Colors.bgDark,
    borderRadius: 12,
  },
  dayName: {
    fontSize: 13,
    // color: Colors.bgDark,
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
    // borderColor: Colors.bgDark,
  },
  numberBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  allCompletedNumber: {
    // backgroundColor: Colors.bgDark,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    // color: Colors.bgDark,
  },
  allCompletedText: {
    // color: Colors.bgDark,
  },
  todayText: {
    // color: Colors.bgDark,
  },
  today: {
    // backgroundColor: Colors.bgDark,
  },
});
