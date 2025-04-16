import { CompletionStatus } from '@/lib/stores/day_status_store';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface DayCellProps {
  date: Date;
  displayValue: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  completionStatus: CompletionStatus;
  onSelect: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  displayValue,
  isCurrentMonth,
  isToday,
  isSelected,
  completionStatus,
  onSelect,
}) => {
  const handlePress = () => {
    onSelect(date);
  };
  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.container, isSelected && styles.selectedDay]}>
        {!isCurrentMonth && (
          <Text style={styles.dayNumber}>{displayValue}</Text>
        )}

        {isCurrentMonth && (
          <>
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
                  {displayValue}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#E3F2FF',
    borderRadius: 12,
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

// Use memo to prevent unnecessary re-renders
export default memo(DayCell);
