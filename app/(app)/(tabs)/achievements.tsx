import Achievements from '@/components/achievements/Achievements';
import { MatrixGrid } from '@/components/achievements/MatrixGrid';
import GatedBlurView from '@/components/shared/GatedBlurView';
import {
  createAppPaywallHandler,
  trackPremiumFeatureAccessAttempted,
} from '@/lib/analytics/superwall';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAllHabits } from '@/lib/hooks/useHabits';
import { useTrackedScreen } from '@/lib/hooks/useTrackedScreen';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { showAchievementsSuperwall } from '@/lib/utils/superwall';
import { usePostHog } from 'posthog-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AchievementsScreen = () => {
  const { subscriptionStatus } = useSubscriptionStatus();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const habits = useAllHabits();
  const posthog = usePostHog();

  useTrackedScreen('achievements');

  const handlePurchase = React.useCallback(() => {
    const capture = (event: string, properties?: Record<string, any>) => {
      posthog.capture(event, properties);
    };
    const paywallContext = {
      placement: 'achievements_view',
      entrypoint: 'locked_overlay',
      current_habit_count: habits.length,
      subscription_status: subscriptionStatus.status,
      feature_name: 'achievements',
      interaction_surface: 'locked_overlay',
    } as const;

    trackPremiumFeatureAccessAttempted(capture, paywallContext);
    showAchievementsSuperwall({
      handler: createAppPaywallHandler(paywallContext, capture),
    });
  }, [habits.length, posthog, subscriptionStatus.status]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainerStyle,
          {
            paddingTop: insets.top + 17,
            paddingBottom: 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('achievements.title')}</Text>
        <MatrixGrid />
        <Achievements />
      </ScrollView>
      {subscriptionStatus.status !== 'ACTIVE' && (
        <GatedBlurView
          handlePurchase={handlePurchase}
          buttonText={t('achievements.unlock')}
          icon="trophy.fill"
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight, // Slightly off-white background for contrast
  },
  contentContainerStyle: { paddingHorizontal: 18 },
  title: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 17,
  },
});

export default AchievementsScreen;
