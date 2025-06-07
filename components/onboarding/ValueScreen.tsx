import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights } from '@/lib/constants/ui';
import type { OnboardingItem } from '@/lib/stores/onboardingStore';
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

interface ValueScreenProps {
  item: OnboardingItem;
}

export default function ValueScreen({ item }: ValueScreenProps) {
  const { t } = useTranslation();

  const valueItems = [
    {
      icon: 'chart.bar.fill',
      titleKey: 'onboarding.value.items.statistics.title',
      descriptionKey: 'onboarding.value.items.statistics.description',
    },
    {
      icon: 'trophy.fill',
      titleKey: 'onboarding.value.items.achievements.title',
      descriptionKey: 'onboarding.value.items.achievements.description',
    },
    {
      icon: 'apps.iphone',
      titleKey: 'onboarding.value.items.widgets.title',
      descriptionKey: 'onboarding.value.items.widgets.description',
    },
    {
      icon: 'flame.fill',
      titleKey: 'onboarding.value.items.streaks.title',
      descriptionKey: 'onboarding.value.items.streaks.description',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{t('onboarding.value.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.value.subtitle')}</Text>
      </View>

      {/* Value Items */}
      <View style={styles.valueContainer}>
        {valueItems.map((valueItem, index) => (
          <View key={index} style={styles.valueItem}>
            <View style={styles.iconContainer}>
              <SymbolView
                name={valueItem.icon as any}
                size={24}
                tintColor={colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.valueTitle}>
                {t(valueItem.titleKey as any)}
              </Text>
              <Text style={styles.valueDescription}>
                {t(valueItem.descriptionKey as any)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    paddingHorizontal: 20,
  },
  questionContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontWeights.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  valueContainer: {
    gap: 20,
  },
  valueItem: {
    ...colors.dropShadow,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryFaded20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontFamily: fontWeights.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: colors.textLight,
    lineHeight: 20,
  },
});
