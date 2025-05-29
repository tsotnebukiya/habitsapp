import { colors, fontWeights } from '@/lib/constants/ui';
import { useWeeklyHabitProgress } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import ItemIcon from '../shared/Icon';

const CIRCLE_SIZE = 18;
const STROKE_WIDTH = 3;

interface ProgressCircleProps {
  progress: number;
  color: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ progress, color }) => {
  const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.circleContainer}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
        {/* Background circle at 20% opacity */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={radius}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          opacity={0.2}
        />
        {/* Progress circle at 100% opacity */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={radius}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
        />
      </Svg>
    </View>
  );
};

export default function WeeklyProgress() {
  const { t } = useTranslation();
  const weeklyProgress = useWeeklyHabitProgress();
  const dailyProgressArrays = Array.from({ length: 7 }, (_, dayIndex) =>
    weeklyProgress.map((habit) => habit.progressLevels[dayIndex] || 0)
  );

  const WEEKDAYS = [
    t('weekdays.short.monday'),
    t('weekdays.short.tuesday'),
    t('weekdays.short.wednesday'),
    t('weekdays.short.thursday'),
    t('weekdays.short.friday'),
    t('weekdays.short.saturday'),
    t('weekdays.short.sunday'),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('stats.thisWeek')}</Text>
      <View style={styles.box}>
        <View style={styles.habitsColumn}>
          {weeklyProgress.map((el, i) => (
            <View key={i} style={styles.habitRow}>
              <ItemIcon icon={el.icon} color={el.color} />
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.habitName}
              >
                {el.name}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.weekColumn}>
          {WEEKDAYS.map((el, i) => (
            <View key={i} style={styles.weekDayColumn}>
              <Text style={styles.weekDay}>{el}</Text>
              <View style={styles.circleColumn}>
                {dailyProgressArrays[i].map((progress, habitIndex) => (
                  <View key={habitIndex} style={styles.circleContainer}>
                    {progress === 0 && <View style={styles.circleEmpty} />}
                    {progress === 1 && (
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                    {progress > 0 && progress < 1 && (
                      <ProgressCircle
                        progress={progress}
                        color={colors.accent}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: colors.text,
    marginBottom: 14,
    opacity: 0.5,
  },
  box: {
    backgroundColor: 'white',
    ...colors.dropShadow,
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    paddingTop: 10,
    gap: 10,
  },
  habitsColumn: {
    flex: 1,
    paddingTop: 24,
    gap: 10,
  },
  weekColumn: {
    flexDirection: 'row',
    gap: 5,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitName: {
    fontSize: 12,
    fontFamily: fontWeights.regular,
    color: 'black',
    flex: 1,
  },
  weekDayColumn: {
    gap: 6,
  },
  weekDay: {
    fontSize: 12,
    fontFamily: fontWeights.semibold,
    color: colors.text,
    opacity: 0.4,
    textAlign: 'center',
    height: 18,
  },
  circleColumn: {
    gap: 10,
  },
  circleContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 100,
    backgroundColor: 'red',
  },
  circleEmpty: {
    width: 18,
    height: 18,
    borderRadius: 100,
    opacity: 0.2,
    backgroundColor: colors.text,
  },
  svg: {
    position: 'absolute',
  },
});
