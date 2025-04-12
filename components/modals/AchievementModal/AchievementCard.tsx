import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Achievement } from '@/lib/constants/achievements';
import { AchievementItem } from '@/components/achievements/AchievementItem';

interface Props {
  achievement: Achievement;
}

const AchievementCard = ({ achievement }: Props) => {
  return (
    <View style={styles.card}>
      <AchievementItem
        achievement={achievement}
        isUnlocked={true}
        large={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
});

export default AchievementCard;
