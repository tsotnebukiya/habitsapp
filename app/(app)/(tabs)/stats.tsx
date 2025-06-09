import GatedBlurView from '@/components/shared/GatedBlurView';
import CalendarViewNew from '@/components/stats/CalendarViewNew';
import Records from '@/components/stats/Records';
import WeeklyProgress from '@/components/stats/WeeklyProgress';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { showStatsSuperwall } from '@/lib/utils/superwall';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatsScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { subscriptionStatus } = useSubscriptionStatus();

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
        <Text style={styles.title}>{t('stats.title')}</Text>
        <CalendarViewNew />
        <Records />
        <WeeklyProgress />
      </ScrollView>
      {subscriptionStatus.status !== 'ACTIVE' && (
        <GatedBlurView
          handlePurchase={showStatsSuperwall}
          buttonText={t('stats.unlock')}
          icon="chart.bar.fill"
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
  contentContainerStyle: {
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 17,
  },
});

export default StatsScreen;
