import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useModalStore } from '@/lib/stores/modal_store';
import AchievementCard from './AchievementCard';
import AchievementIndicators from './AchievementIndicators';
import ConfettiCannon from 'react-native-confetti-cannon';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface Props {
  onDismiss: () => void;
}

const AchievementModal = ({ onDismiss }: Props) => {
  const {
    achievements,
    currentAchievementIndex,
    setAchievementIndex,
    goToNextAchievement,
    goToPrevAchievement,
  } = useModalStore();

  const confettiRef = useRef<ConfettiCannon>(null);
  const position = useRef(new Animated.Value(0)).current;
  const hasMultipleAchievements = achievements.length > 1;

  useEffect(() => {
    confettiRef.current?.start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => hasMultipleAchievements, // Only allow panning with multiple achievements
      onPanResponderMove: (_, { dx }) => {
        if (hasMultipleAchievements) {
          position.setValue(dx);
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        if (!hasMultipleAchievements) return;

        if (dx < -50 && currentAchievementIndex < achievements.length - 1) {
          // Swipe left -> next achievement
          Animated.timing(position, {
            toValue: -width,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            goToNextAchievement();
            position.setValue(0);
          });
        } else if (dx > 50 && currentAchievementIndex > 0) {
          // Swipe right -> previous achievement
          Animated.timing(position, {
            toValue: width,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            goToPrevAchievement();
            position.setValue(0);
          });
        } else {
          // Return to center
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleBackdropPress = () => {
    onDismiss();
  };

  return (
    <Modal
      visible={achievements.length > 0}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContainer}>
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onDismiss}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {/* Navigation arrows for multiple achievements */}
                {hasMultipleAchievements && currentAchievementIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.navButton, styles.navButtonLeft]}
                    onPress={goToPrevAchievement}
                  >
                    <Text style={styles.navButtonText}>←</Text>
                  </TouchableOpacity>
                )}

                {hasMultipleAchievements &&
                  currentAchievementIndex < achievements.length - 1 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.navButtonRight]}
                      onPress={goToNextAchievement}
                    >
                      <Text style={styles.navButtonText}>→</Text>
                    </TouchableOpacity>
                  )}

                <Animated.View
                  style={[
                    styles.cardContainer,
                    { transform: [{ translateX: position }] },
                  ]}
                  {...(hasMultipleAchievements ? panResponder.panHandlers : {})}
                >
                  {achievements.length > 0 && (
                    <AchievementCard
                      achievement={achievements[currentAchievementIndex]}
                    />
                  )}
                </Animated.View>

                {/* Only show indicators if there are multiple achievements */}
                {hasMultipleAchievements && (
                  <AchievementIndicators
                    count={achievements.length}
                    activeIndex={currentAchievementIndex}
                    onPress={setAchievementIndex}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>

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
  blurContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  cardContainer: {
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    transform: [{ translateY: -20 }], // Center vertically
  },
  navButtonLeft: {
    left: 5,
  },
  navButtonRight: {
    right: 5,
  },
  navButtonText: {
    fontSize: 20,
    color: '#555',
    fontWeight: '600',
  },
});

export default AchievementModal;
