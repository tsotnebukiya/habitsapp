import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Achievement } from '@/habits-store/types';

const { height } = Dimensions.get('window');

interface Props {
  achievement: Achievement | null;
  modalRef: React.RefObject<BottomSheetModal>;
  onDismiss: () => void;
}

export const AchievementUnlockModal = ({
  achievement,
  modalRef,
  onDismiss,
}: Props) => {
  const confettiRef = useRef<ConfettiCannon>(null);

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ['40%', '50%'], []); // Adjust as needed

  // Custom backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5} // Adjust backdrop opacity
      />
    ),
    []
  );

  // Trigger confetti when achievement data is available
  useEffect(() => {
    if (achievement) {
      // Slight delay to ensure modal is visible
      const timer = setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  if (!achievement) {
    return null; // Don't render anything if no achievement data
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0} // Start at the first snap point
      snapPoints={snapPoints}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator} // Style the handle
      backgroundStyle={styles.modalBackground} // Style the modal background
    >
      <View style={styles.contentContainer}>
        <Text style={styles.iconText}>{achievement.icon || '🏆'}</Text>
        <Text style={styles.titleText}>Achievement Unlocked!</Text>
        <Text style={styles.achievementName}>{achievement.name}</Text>
        <Text style={styles.descriptionText}>{achievement.description}</Text>
      </View>
      {/* Confetti Cannon - positioned absolutely */}
      <ConfettiCannon
        ref={confettiRef}
        count={200} // Number of confetti pieces
        origin={{ x: -10, y: 0 }} // Start from top-left
        autoStart={false}
        fadeOut
        explosionSpeed={400}
        fallSpeed={3000}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: '#ffffff',
    borderRadius: 24, // Match app style if needed
  },
  handleIndicator: {
    backgroundColor: '#cccccc',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconText: {
    fontSize: 60, // Larger emoji for modal
    marginBottom: 15,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
