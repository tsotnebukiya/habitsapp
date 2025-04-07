import React from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, View } from 'react-native';
import { MatrixGrid } from '@/app/components/MatrixGrid';
import { useMatrix } from '@/lib/hooks/useMatrix';

const StatsScreen = () => {
  const { lastCalculated } = useMatrix();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Stats</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Life Balance Matrix</Text>
          <Text style={styles.sectionSubtitle}>
            Your scores across key life areas
          </Text>
          <MatrixGrid />
          <Text style={styles.lastUpdated}>Last updated: {lastCalculated}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Your Matrix</Text>
          <Text style={styles.sectionText}>
            Each score ranges from 0 to 100 and is calculated based on your
            habit completion rate over the past 14 days. The Balance score
            represents your overall life harmony.
          </Text>
          <Text style={styles.sectionText}>
            Complete your habits consistently to improve your scores!
          </Text>
        </View>

        {/* Additional stats sections can be added here */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
});

export default StatsScreen;
