import { CATEGORIES } from '@/lib/constants/HabitTemplates';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { SymbolView } from 'expo-symbols';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

// Progress Ring Component
function ProgressRing({
  score,
  size = 60,
  strokeWidth = 6,
  color = colors.primary,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.scoreInRing}>
        <Text style={[styles.ringScore, { color }]}>{score}</Text>
      </View>
    </View>
  );
}

export default function MatrixGrid() {
  const { t } = useTranslation();
  const { getMatrixScores } = useOnboardingStore();

  const matrixScores = getMatrixScores();

  // Find strongest and weakest areas
  const { strongest, weakest } = useMemo(() => {
    const scores = [
      { category: 'cat1', score: matrixScores.cat1 },
      { category: 'cat2', score: matrixScores.cat2 },
      { category: 'cat3', score: matrixScores.cat3 },
      { category: 'cat4', score: matrixScores.cat4 },
      { category: 'cat5', score: matrixScores.cat5 },
    ];

    const strongest = scores.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    const weakest = scores.reduce((min, current) =>
      current.score < min.score ? current : min
    );

    return { strongest, weakest };
  }, [matrixScores]);

  const strongestCategory = CATEGORIES.find((c) => c.id === strongest.category);
  const weakestCategory = CATEGORIES.find((c) => c.id === weakest.category);

  // Calculate percentile (mock data for demo)
  const getPercentile = (score: number) => {
    if (score >= 70) return 85;
    if (score >= 60) return 75;
    if (score >= 50) return 65;
    if (score >= 40) return 55;
    return 45;
  };

  // Get improvement potential
  const improvementPotential = Math.min(15, 85 - weakest.score);
  const targetScore = weakest.score + improvementPotential;

  // Get improvement suggestions
  const getImprovementSuggestion = (categoryId: string) => {
    const suggestions = {
      cat1: 'Adding 2 movement habits',
      cat2: 'Daily 15-min learning',
      cat3: 'Weekly friend check-ins',
      cat4: 'Daily 5-min meditation',
      cat5: 'Morning goal-setting',
    };
    return suggestions[categoryId as keyof typeof suggestions];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{t('onboarding.matrix.title')}</Text>
      </View>

      {/* Score Grid */}
      <View style={styles.scoreGrid}>
        {CATEGORIES.map((category) => {
          const score = matrixScores[category.id as keyof typeof matrixScores];
          const isStrongest = category.id === strongest.category;
          const isWeakest = category.id === weakest.category;

          return (
            <View
              key={category.id}
              style={[
                styles.scoreCard,
                { backgroundColor: category.display.background },
                isStrongest && styles.strongestCard,
                isWeakest && styles.weakestCard,
              ]}
            >
              <View style={styles.scoreCardHeader}>
                <SymbolView
                  name={category.icon}
                  size={20}
                  tintColor={category.display.title}
                />
                <Text
                  style={[
                    styles.categoryName,
                    { color: category.display.title },
                  ]}
                >
                  {category.name}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <ProgressRing
                  score={score}
                  size={50}
                  strokeWidth={4}
                  color={category.display.number}
                />
              </View>

              {isStrongest && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {t('onboarding.matrix.badges.strong')}
                  </Text>
                </View>
              )}

              {isWeakest && (
                <View style={[styles.badge, styles.opportunityBadge]}>
                  <Text style={styles.badgeText}>
                    {t('onboarding.matrix.badges.focus')}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Habit-Focused Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.insightTitle}>
            {t('onboarding.matrix.insights.startWith')}{' '}
            <Text style={styles.highlightWeak}>
              {weakestCategory?.name} {t('onboarding.matrix.insights.habits')}
            </Text>
          </Text>
          <Text style={styles.insightSubtitle}>
            {t('onboarding.matrix.insights.alreadyStrong')}{' '}
            <Text style={styles.highlightStrong}>
              {strongestCategory?.name}
            </Text>
            ,{' '}
            {t('onboarding.matrix.insights.focusingSuffix', {
              category: weakestCategory?.name.toLowerCase(),
            })}
          </Text>
        </View>
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
    marginBottom: 20,
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  scoreCard: {
    width: (screenWidth - 56) / 2,
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
    justifyContent: 'space-between',
    position: 'relative',
    alignItems: 'center',
  },
  strongestCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  weakestCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  categoryName: {
    fontSize: 16,
    fontFamily: fontWeights.semibold,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreInRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    fontSize: 16,
    fontFamily: fontWeights.bold,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: '15deg' }],
  },
  opportunityBadge: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontFamily: fontWeights.bold,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryCard: {
    ...colors.dropShadow,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    gap: 8,
  },
  insightTitle: {
    fontSize: 17,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  insightSubtitle: {
    fontSize: 15,
    fontFamily: fontWeights.regular,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlightStrong: {
    color: colors.primary,
    fontFamily: fontWeights.bold,
  },
  highlightWeak: {
    color: colors.accent,
    fontFamily: fontWeights.semibold,
  },
});
