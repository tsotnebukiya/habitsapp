import { router } from 'expo-router';
import { useFeatureFlag } from 'posthog-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import LoadingScreen from '@/components/onboarding/LoadingScreen';
import MiniResultScreen from '@/components/onboarding/MiniResultScreen';
import PickOneHabitScreen from '@/components/onboarding/PickOneHabitScreen';
import ProgressBar from '@/components/onboarding/ProgressBar';
import QuestionScreen from '@/components/onboarding/QuestionScreen';
import Button from '@/components/shared/Button';
import { ACTIVE_OPACITY_WHITE } from '@/components/shared/config';
import { getOnboardingItems } from '@/lib/constants/onboardingQuestions';
import { colors } from '@/lib/constants/ui';
import {
  useOnboardingStore,
  type OnboardingItem,
} from '@/lib/stores/onboardingStore';
import { useTranslation } from 'react-i18next';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function wizard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
  const renderItem = ({ item }: { item: OnboardingItem }) => {
    const renderContent = () => {
      switch (item.type) {
        case 'priority':
        case 'mini':
          return <QuestionScreen item={item} />;

        case 'mini-result':
          return <MiniResultScreen />;

        case 'habit':
          return <PickOneHabitScreen item={item} />;

        case 'spinner':
          return <LoadingScreen item={item} />;

        default:
          return null;
      }
    };

    return (
      <ScrollView
        contentContainerStyle={{ flex: 1, paddingTop: 26 }}
        style={styles.screenContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    );
  };

  const progress = getProgress();

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

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 11 },
      ]}
    >
      <View style={styles.progressContainer}>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY_WHITE}
          onPress={handlePrevious}
        >
          <Icon
            source={require('@/assets/icons/arrow-narrow-left.png')}
            size={24}
          />
        </TouchableOpacity>
        <ProgressBar progress={progress} />
        <View style={{ width: 24 }} />
      </View>

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
      <View style={{ height: 54, paddingHorizontal: 20 }}>
        <Button
          type="primary"
          onPress={handleNext}
          label={t('common.next')}
          fullWidth
          disabled={!canProceed()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flatList: {
    flex: 1,
  },
  screenContainer: {
    width: screenWidth,
    flex: 1,
  },
});
