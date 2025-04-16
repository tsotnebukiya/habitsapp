import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Achievement } from '@/lib/stores/habits/types';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

interface AchievementItemProps {
  achievement: Achievement;
  isUnlocked: boolean;
  large?: boolean; // Optional prop for larger display in modals
}

export const AchievementItem = memo(function AchievementItem({
  achievement,
  isUnlocked,
  large = false,
}: AchievementItemProps) {
  const iconEmoji = achievement.icon || '❓'; // Use achievement icon emoji or default
  const containerStyle = [
    styles.container,
    isUnlocked ? styles.unlocked : styles.locked,
    large && styles.largeContainer,
  ];
  const textColor = isUnlocked ? '#333' : '#888';

  return (
    <View style={containerStyle}>
      <Text style={[styles.iconText, large && styles.largeIcon]}>
        {iconEmoji}
      </Text>
      {large && <Text style={styles.unlockText}>Achievement Unlocked!</Text>}
      <Text
        style={[styles.title, { color: textColor }, large && styles.largeTitle]}
      >
        {achievement.name}
      </Text>
      <Text
        style={[
          styles.description,
          { color: textColor },
          large && styles.largeDescription,
        ]}
        numberOfLines={large ? 4 : 2}
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
  largeContainer: {
    width: '100%',
    height: 'auto',
    marginHorizontal: 0,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
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
  largeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  unlockText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  largeTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
  },
  largeDescription: {
    fontSize: 16,
    marginTop: 4,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(235, 235, 235, 0.4)', // Slightly adjusted overlay
    borderRadius: 12,
  },
});
