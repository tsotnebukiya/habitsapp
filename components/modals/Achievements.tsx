import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useModalStore } from '@/lib/stores/modal_store';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Icon } from 'react-native-paper';
import { ACTIVE_OPACITY_WHITE } from '../shared/config';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.9;

interface AchievementIndicatorsProps {
  count: number;
  activeIndex: number;
  onPress: (index: number) => void;
}

const AchievementIndicators = ({
  count,
  activeIndex,
  onPress,
}: AchievementIndicatorsProps) => {
  return (
    <View style={indicatorStyles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Pressable
          key={index}
          style={[
            indicatorStyles.indicator,
            activeIndex === index && indicatorStyles.activeIndicator,
          ]}
          onPress={() => onPress(index)}
        />
      ))}
    </View>
  );
};

const indicatorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

interface Props {
  onDismiss: () => void;
}

const AchievementsModal = ({ onDismiss }: Props) => {
  const { achievements } = useModalStore();
  const { t } = useTranslation();
  const confettiRef = useRef<ConfettiCannon>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const streakAchievements = useHabitsStore(
    (state) => state.streakAchievements
  );

  // Trigger confetti when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      confettiRef.current?.start();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * MODAL_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / MODAL_WIDTH);

    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < achievements.length
    ) {
      setCurrentIndex(newIndex);
    }
  };

  if (achievements.length === 0) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable style={styles.overlay} onPress={onDismiss}>
          <Pressable style={[styles.modalContainer, { width: MODAL_WIDTH }]}>
            <TouchableOpacity
              onPress={onDismiss}
              activeOpacity={ACTIVE_OPACITY_WHITE}
              style={styles.closeButton}
            >
              <Icon
                source={require('@/assets/icons/x-close.png')}
                size={24}
                color="black"
              />
            </TouchableOpacity>

            {/* Header with congratulations */}
            <View style={styles.header}>
              <Text style={styles.congratsText}>
                🎉 {t('achievements.congratulations')}
              </Text>
              <Text style={styles.achievementText}>
                {achievements.length > 1
                  ? t('achievements.unlockedMultiple')
                  : t('achievements.unlockedSingle')}
              </Text>
            </View>

            <View style={styles.scrollViewWrapper}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                decelerationRate="fast"
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEnabled={true}
              >
                {achievements.map((achievement, index) => {
                  const isUnlocked =
                    streakAchievements[
                      achievement.days as keyof typeof streakAchievements
                    ] || false;

                  return (
                    <View
                      key={index}
                      style={styles.achievementContainer}
                      onStartShouldSetResponder={() => true}
                    >
                      <View style={styles.badgeContainer}>
                        <Image
                          source={
                            isUnlocked
                              ? require('@/assets/icons/unlocked.png')
                              : require('@/assets/icons/locked.png')
                          }
                          style={styles.badgeIcon}
                        />
                        <Text style={styles.badgeText}>
                          {t('achievements.daysStreak', {
                            count: achievement.days,
                          })}
                        </Text>
                        <Text style={styles.badgeName}>
                          {t(`achievements.streak_${achievement.days}` as any)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {achievements.length > 1 && (
              <View style={styles.indicatorContainer}>
                <AchievementIndicators
                  count={achievements.length}
                  activeIndex={currentIndex}
                  onPress={scrollToIndex}
                />
              </View>
            )}
          </Pressable>
        </Pressable>

        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          autoStart={false}
          fadeOut
          explosionSpeed={350}
          fallSpeed={2500}
        />
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.bgLight,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 24,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 24,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: colors.textLight,
    textAlign: 'center',
  },
  scrollViewWrapper: {
    width: MODAL_WIDTH,
    height: 280,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...colors.dropShadow,
  },
  scrollView: {
    width: MODAL_WIDTH,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  achievementContainer: {
    width: MODAL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badgeContainer: {
    alignItems: 'center',
  },
  badgeIcon: {
    width: 140,
    height: 140,
  },
  badgeText: {
    fontSize: 18,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  badgeName: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  indicatorContainer: {
    paddingBottom: 8,
  },
});

export default AchievementsModal;
