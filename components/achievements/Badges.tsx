import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ACTIVE_OPACITY } from '../shared/config';

export default function Badges() {
  const { t } = useTranslation();
  const streakAchievements = useHabitsStore(
    (state) => state.streakAchievements
  );
  const resetAchievements = useHabitsStore((state) => state.resetAchievements);
  const achievementKeys = Object.keys(ACHIEVEMENTS).map(Number);

  const renderBadge = (days: number) => {
    const achievement = ACHIEVEMENTS[days as keyof typeof ACHIEVEMENTS];
    const isUnlocked =
      streakAchievements[days as keyof typeof streakAchievements] || false;

    return (
      <View style={styles.badgeContainer} key={days}>
        <Image
          source={
            isUnlocked
              ? require('@/assets/icons/unlocked.png')
              : require('@/assets/icons/locked.png')
          }
          style={styles.badgeIcon}
        />
        <Text style={styles.badgeText}>
          {t('achievements.daysStreak', { days } as any)}
        </Text>
        <Text style={styles.badgeName}>
          {t(`achievements.streak_${days}` as any)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('achievements.longestStreaks' as any)}
      </Text>

      <View style={styles.grid}>
        {achievementKeys.map((days) => renderBadge(days))}
      </View>
      <TouchableOpacity
        activeOpacity={ACTIVE_OPACITY}
        style={styles.resetButton}
        onPress={resetAchievements}
      >
        <Text style={styles.resetButtonText}>
          {t('achievements.resetAchievements' as any)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 16,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 27,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  badgeContainer: {
    width: '33.333%', // Exactly 1/3 for true 3-column grid
    marginBottom: 16,
    alignItems: 'center',
    paddingHorizontal: 4, // Small padding for spacing between badges
  },
  badgeIcon: {
    width: 107,
    height: 107,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fontWeights.semibold,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeName: {
    fontSize: 12,
    fontFamily: fontWeights.regular,
    color: colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: '#D9D9D9',
    padding: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  resetButtonText: {
    fontSize: 13,
    fontFamily: fontWeights.regular,
    color: 'black',
  },
});
