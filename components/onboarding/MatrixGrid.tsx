import { CATEGORIES } from '@/lib/constants/HabitTemplates';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { SymbolView } from 'expo-symbols';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function MatrixGrid() {
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

  // Calculate improvement potential (realistic 15-20 point boost)
  const improvementPotential = Math.min(20, 70 - weakest.score);

  // Get improvement suggestions based on weakest area
  const getImprovementSuggestion = (categoryId: string) => {
    const suggestions = {
      cat1: 'Just 20 minutes of daily movement could boost this by 15 points',
      cat2: '15 minutes of daily learning could increase this by 18 points',
      cat3: 'Weekly friend check-ins could improve this by 12 points',
      cat4: '5 minutes of daily meditation could raise this by 16 points',
      cat5: 'Daily goal-setting could boost this by 14 points',
    };
    return suggestions[categoryId as keyof typeof suggestions];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Life Balance Snapshot</Text>
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

              <Text style={[styles.score, { color: category.display.number }]}>
                {score}
              </Text>

              {isStrongest && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>💪 Superpower</Text>
                </View>
              )}

              {isWeakest && (
                <View style={[styles.badge, styles.opportunityBadge]}>
                  <Text style={styles.badgeText}>🎯 Quick Win</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Insights Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            💪 Your Superpower: {strongestCategory?.name} ({strongest.score}/70)
          </Text>
          <Text style={styles.summarySubtitle}>
            You're already excelling at{' '}
            {strongestCategory?.description.toLowerCase()}!
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            🎯 Growth Opportunity: {weakestCategory?.name} ({weakest.score}/70)
          </Text>
          <Text style={styles.summarySubtitle}>
            {getImprovementSuggestion(weakest.category)}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  scoreCard: {
    width: (screenWidth - 64) / 2, // 2 cards per row with gaps
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
    justifyContent: 'space-between',
    position: 'relative',
  },
  strongestCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  weakestCard: {
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontFamily: fontWeights.semibold,
  },
  score: {
    fontSize: 28,
    fontFamily: fontWeights.bold,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: '15deg' }],
  },
  opportunityBadge: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontFamily: fontWeights.bold,
  },
  summarySection: {
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    ...colors.dropShadow,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: colors.text,
    opacity: 0.7,
  },
});
