import { Habit } from '@/lib/habit-store/types';
import { useHabitsForDate } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { dateUtils } from '@/lib/utils/dayjs';
import { sortHabits } from '@/lib/utils/habits';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import EmptyHabits from './EmptyHabits';
import HabitDetailsSheet from './HabitDetailsSheet';
import HabitItem from './HabitItem';

interface HabitListProps {
  selectedDate: Date;
}

const HabitList = function HabitList({ selectedDate }: HabitListProps) {
  const { t } = useTranslation();
  const habitsForDate = useHabitsForDate(selectedDate);
  const sortedHabits = useMemo(
    () => sortHabits(habitsForDate),
    [habitsForDate]
  );
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const afterToday = useMemo(() => {
    const today = dateUtils.today();
    return dayjs(selectedDate).startOf('day').isAfter(today);
  }, [selectedDate]);
  const showIsAfterToast = useCallback(() => {
    Toast.show({
      type: 'error',
      text1: t('habits.cannotCompleteFuture'),
      text2: t('habits.waitUntilDay'),
      position: 'bottom',
    });
  }, [t]);

  const handleHabitPress = useCallback(
    (habit: Habit) => {
      if (afterToday) {
        showIsAfterToast();
        return;
      }
      setSelectedHabit(habit);
    },
    [afterToday, showIsAfterToast]
  );

  useEffect(() => {
    if (selectedHabit) {
      bottomSheetModalRef.current?.present();
    }
  }, [selectedHabit]);
  const handleDismiss = useCallback(() => {
    setSelectedHabit(null);
  }, []);

  const renderItem = useCallback(
    ({ item: habit }: { item: Habit }) => (
      <HabitItem
        habit={habit}
        selectedDate={selectedDate}
        onPress={handleHabitPress}
        afterToday={afterToday}
      />
    ),
    [selectedDate, handleHabitPress, afterToday]
  );

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  const renderEmptyComponent = useCallback(
    () => <EmptyHabits selectedDate={selectedDate} />,
    [selectedDate]
  );

  return (
    <>
      <View style={styles.container}>
        <FlashList
          data={sortedHabits}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={83}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      <HabitDetailsSheet
        habit={selectedHabit}
        date={selectedDate}
        bottomSheetModalRef={bottomSheetModalRef}
        onDismiss={handleDismiss}
      />
    </>
  );
};

export default HabitList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingTop: 29,
    paddingHorizontal: 18,
  },
  separator: {
    height: 9,
  },
});
