import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Achievement } from '@/lib/constants/achievements';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

interface AchievementItemProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export const AchievementItem = memo(function AchievementItem({
  achievement,
  isUnlocked,
}: AchievementItemProps) {
  const iconEmoji = achievement.icon || '❓'; // Use achievement icon emoji or default
  const containerStyle = [
    styles.container,
    isUnlocked ? styles.unlocked : styles.locked,
  ];
  const textColor = isUnlocked ? '#333' : '#888';

  return (
    <View style={containerStyle}>
      <Text style={styles.iconText}>{iconEmoji}</Text>
      <Text style={[styles.title, { color: textColor }]}>
        {achievement.name}
      </Text>
      <Text
        style={[styles.description, { color: textColor }]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>
      {!isUnlocked && <View style={styles.lockedOverlay} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    borderRadius: 12, // Slightly larger radius
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to top
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  unlocked: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  locked: {
    backgroundColor: '#f5f5f5',
  },
  iconText: {
    fontSize: 36, // Larger size for emoji icon
    marginBottom: 12,
    marginTop: 5, // Add some top margin
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(235, 235, 235, 0.4)', // Slightly adjusted overlay
    borderRadius: 12,
  },
});
