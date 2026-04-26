import { router } from 'expo-router';
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
import { useOnboardingAnalytics } from '@/lib/hooks/useOnboardingAnalytics';
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
  const { analyticsReady, flowVariant, capture, screen } =
    useOnboardingAnalytics();
  const {
    currentIndex,
    startedAt,
    setCurrentIndex,
    setResumeRoute,
    setTotalItems,
    markStarted,
    markCompleted,
    getProgress,
    hasAnswer,
    calculateAndSetMatrixScores,
  } = useOnboardingStore();
  const items = useMemo(() => {
    return analyticsReady ? getOnboardingItems(flowVariant || 'standard') : [];
  }, [analyticsReady, flowVariant]);

  useEffect(() => {
    setResumeRoute('/onboarding/wizard');
  }, [setResumeRoute]);

  const buildStepPayload = (index: number) => {
    const item = items[index];

    return {
      step_id: item?.id,
      step_index: index,
      step_type: item?.type,
      total_steps: items.length,
    };
  };

  useEffect(() => {
    if (analyticsReady) {
      setTotalItems(items.length);
    }
  }, [analyticsReady, items.length, setTotalItems]);

  useEffect(() => {
    if (analyticsReady && !startedAt && items.length > 0) {
      markStarted();
      capture('onboarding_started', buildStepPayload(0));
    }
  }, [
    analyticsReady,
    capture,
    items.length,
    markStarted,
    items,
    startedAt,
  ]);

  useEffect(() => {
    if (!analyticsReady) {
      return;
    }

    screen('onboarding_wizard', {
      total_steps: items.length,
    });
  }, [analyticsReady, items.length, screen]);

  const handleNext = useCallback(() => {
    const currentItem = items[currentIndex];
    const nextIndex = currentIndex + 1;

    if (currentItem?.type === 'mini' && nextIndex < items.length) {
      const nextItem = items[nextIndex];
      if (nextItem?.type !== 'mini') {
        calculateAndSetMatrixScores();
      }
    }

    capture('onboarding_step_completed', {
      ...buildStepPayload(currentIndex),
      from_step_index: currentIndex,
      to_step_index: nextIndex,
    });

    if (nextIndex >= items.length) {
      setResumeRoute('/onboarding/commitment');
      markCompleted();
      capture('onboarding_completed', {
        ...buildStepPayload(currentIndex),
        exit_step_index: currentIndex,
      });
      router.push('/onboarding/commitment');
      return;
    }

    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  }, [
    currentIndex,
    capture,
    items,
    setCurrentIndex,
    calculateAndSetMatrixScores,
    markCompleted,
  ]);

  // Navigate to previous screen
  const handlePrevious = useCallback(() => {
    const prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      router.back();
      return;
    }

    capture('onboarding_step_previous', {
      ...buildStepPayload(currentIndex),
      from_step_index: currentIndex,
      to_step_index: prevIndex,
    });

    setCurrentIndex(prevIndex);
    flatListRef.current?.scrollToIndex({
      index: prevIndex,
      animated: true,
    });
  }, [capture, currentIndex, setCurrentIndex, items]);

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

  if (!analyticsReady) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 11 },
        ]}
      />
    );
  }

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
