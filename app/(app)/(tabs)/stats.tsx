import React from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, View } from 'react-native';
import { MatrixGrid } from '@/components/matrix/MatrixGrid';
import { useMatrix } from '@/lib/hooks/useMatrix';

// Import Achievement Components
import { StreakDisplay } from '@/components/achievements/StreakDisplay';
import { QuoteDisplay } from '@/components/achievements/QuoteDisplay';
import { AchievementsList } from '@/components/achievements/AchievementsList';

// Simple Separator Component
const Separator = () => <View style={styles.separator} />;

const StatsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Life Balance Matrix</Text>
          <Text style={styles.sectionSubtitle}>
            Your scores across key life areas
          </Text>
          <MatrixGrid />
        </View>

        {/* Achievements Section - Wrapped in Glass Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress & Achievements</Text>
          <View style={styles.glassCard}>
            <StreakDisplay />
            <Separator />
            <QuoteDisplay />
            <Separator />
            <AchievementsList />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Slightly off-white background for contrast
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48, // Ensure space at the bottom
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24, // Adjusted spacing between sections
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16, // Increased space below title
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Slightly less transparent
    borderRadius: 18, // Increased radius
    paddingTop: 15, // Adjust padding
    paddingBottom: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20, // Indent separator
    marginVertical: 10, // Space around separator
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
});

export default StatsScreen;
