import { router } from 'expo-router';
import { useFeatureFlag } from 'posthog-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MiniResultScreen from '@/components/onboarding/MiniResultScreen';
import PickOneHabitScreen from '@/components/onboarding/PickOneHabitScreen';
import ProgressBar from '@/components/onboarding/ProgressBar';
import QuestionScreen from '@/components/onboarding/QuestionScreen';
import SpinnerTailorScreen from '@/components/onboarding/SpinnerTailorScreen';
import { getOnboardingItems } from '@/lib/constants/onboardingQuestions';
import {
  useOnboardingStore,
  type OnboardingItem,
} from '@/lib/stores/onboardingStore';

const { width: screenWidth } = Dimensions.get('window');

export default function wizard() {
  const flatListRef = useRef<FlatList>(null);
  const variant = useFeatureFlag('onboard_variant');

  const {
    currentIndex,
    setVariant,
    setCurrentIndex,
    setTotalItems,
    markStarted,
    getProgress,
    hasAnswer,
    getAnswer,
  } = useOnboardingStore();

  // Get items based on variant
  const items = useMemo(() => {
    if (!variant || typeof variant !== 'string') return [];
    return getOnboardingItems(variant);
  }, [variant]);

  // Initialize store when component mounts
  useEffect(() => {
    if (variant && typeof variant === 'string') {
      setVariant(variant);
      setTotalItems(items.length);
      markStarted();
    }
  }, [variant, items.length, setVariant, setTotalItems, markStarted]);

  // Navigate to next screen
  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= items.length) {
      // Completed onboarding
      router.push('/onboarding/login');
      return;
    }

    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  // Navigate to previous screen
  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      router.back();
      return;
    }

    setCurrentIndex(prevIndex);
    flatListRef.current?.scrollToIndex({
      index: prevIndex,
      animated: true,
    });
  };

  // Render individual screen based on item type
  const renderItem = ({
    item,
    index,
  }: {
    item: OnboardingItem;
    index: number;
  }) => {
    const isActive = index === currentIndex;

    if (!isActive) {
      // Render empty view for non-active items to maintain FlatList structure
      return <View style={styles.screenContainer} />;
    }

    const commonProps = {
      item,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isFirstScreen: currentIndex === 0,
      isLastScreen: currentIndex === items.length - 1,
    };

    switch (item.type) {
      case 'priority':
      case 'mini':
        return <QuestionScreen {...commonProps} />;

      case 'mini-result':
        return <MiniResultScreen {...commonProps} />;

      case 'habit':
        return <PickOneHabitScreen {...commonProps} />;

      case 'spinner':
        return <SpinnerTailorScreen {...commonProps} />;

      default:
        return <View style={styles.screenContainer} />;
    }
  };

  const progress = getProgress();
  const isFirstScreen = currentIndex === 0;
  const isLastScreen = currentIndex === items.length - 1;

  // Check if current screen can proceed
  const canProceed = () => {
    if (items.length === 0) return false;

    const currentItem = items[currentIndex];
    if (!currentItem) return false;

    switch (currentItem.type) {
      case 'priority':
      case 'mini':
        // Question screens require an answer if required
        return currentItem.required ? hasAnswer(currentItem.id) : true;

      case 'mini-result':
        // Result screen can always proceed
        return true;

      case 'habit':
        // Habit screen requires both habit and frequency selection
        const habitAnswer = getAnswer(currentItem.id) as any;
        return habitAnswer?.selectedHabit && habitAnswer?.frequency;

      case 'spinner':
        // Spinner screen requires at least 2 preferences
        const spinnerAnswer = getAnswer(currentItem.id) as any;
        return spinnerAnswer?.selectedPreferences?.length >= 2;

      default:
        return false;
    }
  };

  if (!variant || items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Add loading indicator if needed */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
      </View>

      {/* FlatList with horizontal scrolling */}
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // Disable manual scrolling
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        initialScrollIndex={currentIndex}
        style={styles.flatList}
      />

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handlePrevious}
          disabled={isFirstScreen}
        >
          <Text
            style={[styles.buttonText, isFirstScreen && styles.disabledText]}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            !canProceed() && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text
            style={[
              styles.buttonText,
              !canProceed() && styles.disabledButtonText,
            ]}
          >
            {isLastScreen ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  screenContainer: {
    width: screenWidth,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});
