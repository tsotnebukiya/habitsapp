import { fontWeights } from '@/lib/constants/ui';
import { useThreeMonthsStatuses } from '@/lib/hooks/useHabits';
import { useModalStore } from '@/lib/stores/modal_store';
import { dateUtils } from '@/lib/utils/dayjs';
import { getRelativeDateText, isToday } from '@/lib/utils/misc';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import dayjs, { Dayjs } from 'dayjs';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { DATE_ITEM_WIDTH, WEEK_VIEW_ITEM_GAP } from '../shared/config';
import DateItem from './DateItem';

interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

type DateItem = {
  date: Dayjs;
  type?: 'spacer';
};

export const WeekView = memo(function WeekView({
  selectedDate,
  onDateSelect,
}: WeekViewProps) {
  const monthStatuses = useThreeMonthsStatuses();
  const flatListRef = useRef<FlashList<any>>(null);
  const selectedDayjs = dayjs(selectedDate);
  const showSortModal = useModalStore((state) => state.showSortModal);

  const dates = useMemo(() => {
    const result: DateItem[] = [];
    const startOfPrevMonth = dateUtils
      .today()
      .subtract(3, 'month')
      .startOf('month');
    const endOfNextMonth = dateUtils.today().add(3, 'month').endOf('month');

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
      .today()
      .subtract(3, 'month')
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
      const dateKey = dateUtils.toLocalDateString(item.date.toDate());
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

  const returnToToday = () => {
    onDateSelect(dateUtils.today().toDate());
  };
  const handleSort = () => {
    showSortModal();
  };
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
        <View style={styles.dayContainer}>
          <Text style={styles.topText}>
            {getRelativeDateText(selectedDate)}
          </Text>
          {!isToday(selectedDate) && (
            <IconButton
              style={styles.marginNone}
              onPress={returnToToday}
              icon={() => <MaterialIcons name="restore" size={24} />}
            />
          )}
        </View>

        <IconButton
          onPress={handleSort}
          style={styles.marginNone}
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
  dayContainer: {
    flexDirection: 'row',
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
    width: 24,
  },
  marginNone: {
    margin: 0,
    marginLeft: 4,
  },
});
