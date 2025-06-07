import { router } from 'expo-router';
import { useFeatureFlag } from 'posthog-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import LoadingScreen from '@/components/onboarding/LoadingScreen';
import MatrixGrid from '@/components/onboarding/MatrixGrid';
import ProgressBar from '@/components/onboarding/ProgressBar';
import QuestionScreen from '@/components/onboarding/QuestionScreen';
import ValueScreen from '@/components/onboarding/ValueScreen';
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
    calculateAndSetMatrixScores,
  } = useOnboardingStore();
  const items = useMemo(() => {
    const actualVariant = (variant as string) || 'minimal';
    return getOnboardingItems(actualVariant);
  }, [variant]);

  useEffect(() => {
    if (variant && typeof variant === 'string') {
      setVariant(variant);
      setTotalItems(items.length);
      markStarted();
    }
  }, [variant, items.length, setVariant, setTotalItems, markStarted]);

  const handleNext = useCallback(() => {
    const currentItem = items[currentIndex];
    const nextIndex = currentIndex + 1;

    if (currentItem?.type === 'mini' && nextIndex < items.length) {
      const nextItem = items[nextIndex];
      if (nextItem?.type !== 'mini') {
        calculateAndSetMatrixScores();
      }
    }

    if (nextIndex >= items.length) {
      router.push('/onboarding/login');
      return;
    }

    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  }, [currentIndex, items, setCurrentIndex, calculateAndSetMatrixScores]);

  // Navigate to previous screen
  const handlePrevious = useCallback(() => {
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
  }, [currentIndex, setCurrentIndex]);

  // Render individual screen based on item type
  const renderItem = ({
    item,
    index,
  }: {
    item: OnboardingItem;
    index: number;
  }) => {
    const renderContent = () => {
      switch (item.type) {
        case 'priority':
        case 'mini':
          return <QuestionScreen item={item} />;

        case 'loading':
          return (
            <LoadingScreen
              currentIndex={currentIndex}
              key="loading-screen"
              item={item}
              onComplete={handleNext}
              isActive={index === currentIndex}
            />
          );

        case 'matrix':
          return <MatrixGrid />;

        case 'value':
          return <ValueScreen item={item} />;

        default:
          return null;
      }
    };

    return (
      <ScrollView
        contentContainerStyle={{ paddingTop: 26 }}
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
        return hasAnswer(currentItem.id);

      case 'loading':
      case 'matrix':
      case 'value':
        // Loading and matrix screens can always proceed
        return true;

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
          onPress={handlePrevious}
          style={styles.backButton}
          activeOpacity={ACTIVE_OPACITY_WHITE}
        >
          <Icon
            source={require('@/assets/icons/chevron-left.png')}
            size={18}
            color="black"
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
        {items[currentIndex]?.type !== 'loading' && (
          <Button
            type="primary"
            onPress={handleNext}
            label={
              items[currentIndex]?.type === 'value'
                ? t('onboarding.wizard.startBuildingHabits')
                : t('common.next')
            }
            fullWidth
            disabled={!canProceed()}
          />
        )}
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
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    flex: 1,
  },
  screenContainer: {
    width: screenWidth,
    flex: 1,
  },
});
