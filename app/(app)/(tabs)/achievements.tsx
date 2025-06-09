import Achievements from '@/components/achievements/Achievements';
import { MatrixGrid } from '@/components/achievements/MatrixGrid';
import GatedBlurView from '@/components/shared/GatedBlurView';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { showAchievementsSuperwall } from '@/lib/utils/superwall';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AchievementsScreen = () => {
  const { subscriptionStatus } = useSubscriptionStatus();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
          handlePurchase={showAchievementsSuperwall}
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
