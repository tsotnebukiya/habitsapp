import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useModalStore } from '@/lib/stores/modal_store';
import ConfettiCannon from 'react-native-confetti-cannon';
import { BlurView } from 'expo-blur';
import { AchievementItem } from '@/components/achievements/AchievementItem';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;

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
    marginTop: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#333',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

interface Props {
  onDismiss: () => void;
}

const AchievementsModal = ({ onDismiss }: Props) => {
  const { achievements, currentAchievementIndex, setAchievementIndex } =
    useModalStore();
  const confettiRef = useRef<ConfettiCannon>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * MODAL_WIDTH,
      animated: true,
    });
  };

  if (achievements.length === 0) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable style={styles.overlay} onPress={onDismiss}>
          <Pressable style={[styles.modalContainer, { width: MODAL_WIDTH }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

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
              >
                {achievements.map((achievement, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.achievementContainer,
                      { width: MODAL_WIDTH },
                    ]}
                  >
                    <AchievementItem
                      achievement={achievement}
                      isUnlocked={true}
                      large={true}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {achievements.length > 1 && (
              <View style={styles.indicatorContainer}>
                <AchievementIndicators
                  count={achievements.length}
                  activeIndex={currentAchievementIndex}
                  onPress={scrollToIndex}
                />
              </View>
            )}
          </Pressable>
        </Pressable>

        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart={false}
          fadeOut
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
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  scrollViewWrapper: {
    width: MODAL_WIDTH,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  scrollView: {
    width: MODAL_WIDTH,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  achievementContainer: {
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    paddingBottom: 20,
  },
});

export default AchievementsModal;
