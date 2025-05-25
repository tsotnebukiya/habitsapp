import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ACTIVE_OPACITY } from '../shared/config';

function DividerSpacer() {
  return <View style={styles.separator} />;
}
export default function Achievements() {
  const streakAchievements = useHabitsStore(
    (state) => state.streakAchievements
  );
  const currentStreak = useHabitsStore((state) => state.getCurrentStreak());
  const achievementKeys = Object.keys(ACHIEVEMENTS).map(Number);

  const nextAchievement = achievementKeys.find(
    (days) =>
      days > currentStreak &&
      !streakAchievements[days as keyof typeof streakAchievements]
  );
  const daysToNext = nextAchievement ? nextAchievement - currentStreak : 0;

  const renderBadge = ({ item: days }: { item: number }) => {
    const achievement = ACHIEVEMENTS[days as keyof typeof ACHIEVEMENTS];
    const isUnlocked =
      streakAchievements[days as keyof typeof streakAchievements] || false;

    return (
      <View style={styles.achievementCard}>
        <Image
          source={
            isUnlocked
              ? require('@/assets/icons/unlocked.png')
              : require('@/assets/icons/locked.png')
          }
          style={styles.achievementIcon}
        />
        <Text style={styles.achievementTitle}>{days} day streak</Text>
        <Text style={styles.achievementDescription}>{achievement.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Progress</Text>
      <View style={styles.box}>
        <View style={styles.topProgress}>
          <Text style={styles.calendarIcon}>🗓️</Text>
          <Text style={styles.days}>
            {daysToNext} {daysToNext === 1 ? 'Day' : 'Days'}
          </Text>
          <Text style={styles.daysToNextStreak}>Until next achievement</Text>
        </View>
        <View style={styles.bottomProgress}>
          <View style={styles.milestonesHeader}>
            <Text style={styles.achievementsTitle}>Milestones</Text>
            <TouchableOpacity
              onPress={() => router.push('/badges')}
              activeOpacity={ACTIVE_OPACITY}
            >
              <Text style={styles.viewEarnedButton}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flashListContainer}>
            <FlashList
              data={achievementKeys}
              renderItem={renderBadge}
              horizontal
              estimatedItemSize={152}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={DividerSpacer}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 16,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 25,
  },
  box: {
    borderRadius: 16,
    backgroundColor: 'white',
    ...colors.dropShadow,
  },
  topProgress: {
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingTop: 25,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 23,
  },
  calendarIcon: {
    fontSize: 34,
    fontFamily: fontWeights.bold,
    marginBottom: 2,
  },
  days: {
    fontSize: 30,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 10,
  },
  daysToNextStreak: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: 'black',
  },
  bottomProgress: {
    paddingTop: 17,
    paddingLeft: 17,
    paddingBottom: 16,
  },
  achievementsTitle: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    color: colors.text,
    marginBottom: 12,
  },
  flashListContainer: {
    height: 170, // Match Figma card height
  },
  achievementCard: {
    width: 152, // Match Figma width
    height: 170, // Match Figma height
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 13,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementIcon: {
    width: 68,
    height: 68,
    marginBottom: 13,
  },
  achievementTitle: {
    fontSize: 13,
    fontFamily: fontWeights.bold,
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 11,
    fontFamily: fontWeights.regular,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
  },
  separator: {
    width: 9, // Space between cards
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewEarnedButton: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    color: colors.secondary,
    paddingRight: 10,
  },
});
