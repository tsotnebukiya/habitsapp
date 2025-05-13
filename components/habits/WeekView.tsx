import { DATE_ITEM_WIDTH, WEEK_VIEW_ITEM_GAP } from '@/lib/constants/layouts';
import useHabitsStore from '@/lib/habit-store/store';
import { dateUtils } from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import DateItem from './DateItem';

interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

type DateItem = {
  date: Dayjs;
  dateWeek: string;
  dateNumber: string;
};

export const WeekView = memo(function WeekView({
  selectedDate,
  onDateSelect,
}: WeekViewProps) {
  const flatListRef = useRef<FlatList<any>>(null);
  const selectedDayjs = dateUtils.fromUTC(selectedDate);
  const { getDayStatus } = useHabitsStore();

  const dates = useMemo(() => {
    const result: DateItem[] = [];

    const startOfPrevMonth = dateUtils
      .todayUTC()
      .subtract(1, 'month')
      .startOf('month');
    const endOfNextMonth = dateUtils.todayUTC().add(1, 'month').endOf('month');

    let currentDate = startOfPrevMonth.clone();

    while (
      currentDate.isBefore(endOfNextMonth) ||
      currentDate.isSame(endOfNextMonth, 'day')
    ) {
      result.push({
        date: currentDate.clone(),
        dateWeek: currentDate.format('ddd'),
        dateNumber: currentDate.format('D'),
      });
      currentDate = currentDate.add(1, 'day');
    }

    return result;
  }, []);

  const selectedIndex = dates.findIndex((item) =>
    item.date.isSame(selectedDayjs, 'day')
  );

  useEffect(() => {
    if (selectedIndex !== -1 && flatListRef.current) {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true, // No animation on first mount
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex]);

  const renderDateItem = ({ item }: { item: DateItem }) => {
    const { date, dateWeek, dateNumber } = item;
    const isSelected = date.isSame(selectedDayjs, 'day');
    const completionStatus = getDayStatus(date.toDate());
    return (
      <DateItem
        key={date.format('YYYY-MM-DD')}
        onPress={() => onDateSelect(date.toDate())}
        isSelected={isSelected}
        dateWeek={dateWeek}
        dateNumber={dateNumber}
        completionStatus={completionStatus}
      />
    );
  };

  const keyExtractor = (item: DateItem) => item.date.format('YYYY-MM-DD');

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: DATE_ITEM_WIDTH + WEEK_VIEW_ITEM_GAP,
      offset: (DATE_ITEM_WIDTH + WEEK_VIEW_ITEM_GAP) * index,
      index,
    }),
    []
  );

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
        snapToInterval={DATE_ITEM_WIDTH + WEEK_VIEW_ITEM_GAP}
        decelerationRate="fast"
        initialNumToRender={7}
        windowSize={11}
        initialScrollIndex={selectedIndex - 3}
      />
    </View>
  );
});

export default WeekView;

const styles = StyleSheet.create({
  container: {
    height: 77,
  },
  scrollContent: {
    paddingHorizontal: WEEK_VIEW_ITEM_GAP,
  },
});
