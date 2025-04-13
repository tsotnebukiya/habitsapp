import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '@/lib/constants/Colors';

export interface DayCellProps {
  date: Date;
  displayValue: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasCompletion: boolean;
  isStreak?: boolean;
  onSelect: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  displayValue,
  isCurrentMonth,
  isToday,
  isSelected,
  hasCompletion,
  isStreak = false,
  onSelect,
}) => {
  const handlePress = () => {
    onSelect(date);
  };

  // Combined rendering approach with clear visual hierarchy
  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
          isStreak && isCurrentMonth && styles.streakContainer,
        ]}
      >
        {/* Day number with appropriate styling */}
        <View
          style={[styles.dayNumberContainer, isToday && styles.todayContainer]}
        >
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.otherMonthText,
              isToday && styles.todayText,
              isSelected && styles.selectedText,
            ]}
          >
            {displayValue}
          </Text>
        </View>

        {/* Completion indicator */}
        {hasCompletion && (
          <View
            style={[
              styles.completionIndicator,
              isStreak && styles.streakCompletionIndicator,
            ]}
          />
        )}

        {/* Streak indicator (only show if this is part of a streak) */}
        {isStreak && isCurrentMonth && !hasCompletion && (
          <View style={styles.streakIndicator} />
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
    borderRadius: 10,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  selectedContainer: {
    backgroundColor: Colors.shared.primary[50],
    borderWidth: 1,
    borderColor: Colors.shared.primary[200],
  },
  streakContainer: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.shared.primary[300],
  },
  dayNumberContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  todayContainer: {
    backgroundColor: Colors.shared.primary[500],
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  otherMonthText: {
    color: Colors.light.text.disabled,
    fontWeight: '400',
  },
  todayText: {
    color: Colors.light.background.default,
  },
  selectedText: {
    color: Colors.shared.primary[700],
  },
  completionIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.shared.primary[400],
  },
  streakCompletionIndicator: {
    backgroundColor: Colors.shared.primary[600],
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  streakIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.shared.primary[300],
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(DayCell);
