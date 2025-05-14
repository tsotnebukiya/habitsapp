import { DATE_ITEM_WIDTH, WEEK_VIEW_ITEM_GAP } from '@/lib/constants/layouts';
import { fontWeights } from '@/lib/constants/Typography';
import { useThreeMonthsStatuses } from '@/lib/hooks/useHabits';
import { dateUtils } from '@/lib/utils/dayjs';
import { FlashList } from '@shopify/flash-list';
import { Dayjs } from 'dayjs';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import DateItem from './DateItem';

interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

type DateItem = {
  date: Dayjs;
  type?: 'spacer';
};

const getRelativeDateText = (date: Date): string => {
  const today = dateUtils.todayUTC();
  const targetDate = dateUtils.fromUTC(date);

  if (targetDate.isSame(today, 'day')) {
    return 'Today';
  }

  if (targetDate.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }

  if (targetDate.isSame(today.add(1, 'day'), 'day')) {
    return 'Tomorrow';
  }

  // If it's a different year, include the year
  if (!targetDate.isSame(today, 'year')) {
    return targetDate.format('D MMMM YYYY');
  }

  return targetDate.format('D MMMM');
};

export const WeekView = memo(function WeekView({
  selectedDate,
  onDateSelect,
}: WeekViewProps) {
  const monthStatuses = useThreeMonthsStatuses();
  const flatListRef = useRef<FlashList<any>>(null);
  const selectedDayjs = dateUtils.fromUTC(selectedDate);

  const dates = useMemo(() => {
    const result: DateItem[] = [];
    const startOfPrevMonth = dateUtils
      .todayUTC()
      .subtract(1, 'month')
      .startOf('month');
    const endOfNextMonth = dateUtils.todayUTC().add(1, 'month').endOf('month');

    // Add start spacer
    result.push({ date: startOfPrevMonth.clone(), type: 'spacer' });

    let currentDate = startOfPrevMonth.clone();

    while (
      currentDate.isBefore(endOfNextMonth) ||
      currentDate.isSame(endOfNextMonth, 'day')
    ) {
      result.push({
        date: currentDate.clone(),
      });
      currentDate = currentDate.add(1, 'day');
    }

    // Add end spacer
    result.push({ date: endOfNextMonth.clone(), type: 'spacer' });

    return result;
  }, []);

  const selectedIndex = useMemo(() => {
    const startOfPrevMonth = dateUtils
      .todayUTC()
      .subtract(1, 'month')
      .startOf('month');

    // Add 1 to account for the start spacer
    return selectedDayjs.diff(startOfPrevMonth, 'day') + 1;
  }, [selectedDayjs]);

  const renderDateItem = useCallback(
    ({ item, index }: { item: DateItem; index: number }) => {
      // Render spacer
      if (item.type === 'spacer') {
        return <View style={styles.spacer} />;
      }

      const isSelected = item.date.isSame(selectedDayjs, 'day');
      const dateKey = dateUtils.toServerDateString(item.date.toDate());
      const status = monthStatuses[dateKey] || 0;

      return (
        <DateItem
          onPress={onDateSelect}
          isSelected={isSelected}
          date={item.date}
          itemIndex={index}
          completionStatus={status}
        />
      );
    },
    [selectedDayjs, onDateSelect, monthStatuses]
  );

  const keyExtractor = useCallback((item: DateItem) => {
    if (item.type === 'spacer') {
      return `spacer-${item.date.format('YYYY-MM-DD')}`;
    }
    return item.date.format('YYYY-MM-DD');
  }, []);

  useEffect(() => {
    if (selectedIndex !== -1 && flatListRef.current) {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.topText}>{getRelativeDateText(selectedDate)}</Text>
        <IconButton
          onPress={() => {
            console.log('pressed');
          }}
          icon={() => (
            <Icon source={require('@/assets/icons/sliders-02.png')} size={24} />
          )}
        />
      </View>
      <FlashList
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={DATE_ITEM_WIDTH + WEEK_VIEW_ITEM_GAP}
        decelerationRate="fast"
        initialScrollIndex={selectedIndex - 3}
        ref={flatListRef}
        extraData={selectedDayjs}
        removeClippedSubviews
        estimatedItemSize={DATE_ITEM_WIDTH + WEEK_VIEW_ITEM_GAP}
      />
    </View>
  );
});

export default WeekView;

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  topContainer: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topText: {
    fontSize: 26,
    fontFamily: fontWeights.interBold,
    color: 'black',
  },
  scrollContent: {
    paddingHorizontal: WEEK_VIEW_ITEM_GAP,
  },
  spacer: {
    // width: 24 - WEEK_VIEW_ITEM_GAP / 2,
    width: 24,
  },
});
