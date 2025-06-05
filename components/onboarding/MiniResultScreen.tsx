import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import {
  useOnboardingStore,
  type OnboardingItem,
} from '@/lib/stores/onboardingStore';

const { width: screenWidth } = Dimensions.get('window');

interface MiniResultScreenProps {
  item: OnboardingItem;
  onNext: () => void;
  onPrevious: () => void;
  isFirstScreen: boolean;
  isLastScreen: boolean;
}

// Helper function to calculate scores from mini assessment answers
function calculateMiniAssessmentScores(answers: Record<string, any>) {
  const motivationAnswers = [
    answers['mini-motivation-1'],
    answers['mini-motivation-2'],
  ].filter(Boolean);

  const consistencyAnswers = [
    answers['mini-consistency-1'],
    answers['mini-consistency-2'],
  ].filter(Boolean);

  const goalsAnswers = [
    answers['mini-goals-1'],
    answers['mini-goals-2'],
  ].filter(Boolean);

  const scoreMap = {
    'Strongly Disagree': 1,
    Disagree: 2,
    Neutral: 3,
    Agree: 4,
    'Strongly Agree': 5,
  };

  const calculateAverage = (answers: string[]) => {
    if (answers.length === 0) return 0;
    const total = answers.reduce(
      (sum, answer) => sum + (scoreMap[answer as keyof typeof scoreMap] || 0),
      0
    );
    return Math.round((total / answers.length) * 20); // Convert to percentage
  };

  return {
    motivation: calculateAverage(motivationAnswers),
    consistency: calculateAverage(consistencyAnswers),
    goals: calculateAverage(goalsAnswers),
  };
}

export default function MiniResultScreen({
  item,
  onNext,
  onPrevious,
  isFirstScreen,
  isLastScreen,
}: MiniResultScreenProps) {
  const { answers } = useOnboardingStore();
  const scores = calculateMiniAssessmentScores(answers);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Developing';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Readiness Profile</Text>
          <Text style={styles.subtitle}>
            Based on your responses, here's how ready you are to build lasting
            habits:
          </Text>
        </View>

        {/* Score Grid */}
        <View style={styles.scoresContainer}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreCategory}>Motivation</Text>
              <View
                style={[
                  styles.scoreCircle,
                  { borderColor: getScoreColor(scores.motivation) },
                ]}
              >
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(scores.motivation) },
                  ]}
                >
                  {scores.motivation}%
                </Text>
              </View>
              <Text
                style={[
                  styles.scoreLabel,
                  { color: getScoreColor(scores.motivation) },
                ]}
              >
                {getScoreLabel(scores.motivation)}
              </Text>
            </View>

            <View style={styles.scoreItem}>
              <Text style={styles.scoreCategory}>Consistency</Text>
              <View
                style={[
                  styles.scoreCircle,
                  { borderColor: getScoreColor(scores.consistency) },
                ]}
              >
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(scores.consistency) },
                  ]}
                >
                  {scores.consistency}%
                </Text>
              </View>
              <Text
                style={[
                  styles.scoreLabel,
                  { color: getScoreColor(scores.consistency) },
                ]}
              >
                {getScoreLabel(scores.consistency)}
              </Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreCategory}>Goal Setting</Text>
              <View
                style={[
                  styles.scoreCircle,
                  { borderColor: getScoreColor(scores.goals) },
                ]}
              >
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(scores.goals) },
                  ]}
                >
                  {scores.goals}%
                </Text>
              </View>
              <Text
                style={[
                  styles.scoreLabel,
                  { color: getScoreColor(scores.goals) },
                ]}
              >
                {getScoreLabel(scores.goals)}
              </Text>
            </View>

            {/* Overall Score */}
            <View style={styles.scoreItem}>
              <Text style={styles.scoreCategory}>Overall</Text>
              <View
                style={[
                  styles.scoreCircle,
                  {
                    borderColor: getScoreColor(
                      Math.round(
                        (scores.motivation +
                          scores.consistency +
                          scores.goals) /
                          3
                      )
                    ),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scoreValue,
                    {
                      color: getScoreColor(
                        Math.round(
                          (scores.motivation +
                            scores.consistency +
                            scores.goals) /
                            3
                        )
                      ),
                    },
                  ]}
                >
                  {Math.round(
                    (scores.motivation + scores.consistency + scores.goals) / 3
                  )}
                  %
                </Text>
              </View>
              <Text
                style={[
                  styles.scoreLabel,
                  {
                    color: getScoreColor(
                      Math.round(
                        (scores.motivation +
                          scores.consistency +
                          scores.goals) /
                          3
                      )
                    ),
                  },
                ]}
              >
                {getScoreLabel(
                  Math.round(
                    (scores.motivation + scores.consistency + scores.goals) / 3
                  )
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Insight */}
        <View style={styles.insightContainer}>
          <Text style={styles.insightText}>
            We'll use this profile to personalize your habit-building experience
            and provide targeted support where you need it most.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  scoresContainer: {
    gap: 32,
    marginBottom: 40,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  insightContainer: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    marginTop: 'auto',
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
});
