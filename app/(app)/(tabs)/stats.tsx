import { MatrixGrid } from '@/components/matrix/MatrixGrid';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import Achievement Components
import { AchievementsList } from '@/components/achievements/AchievementsList';
import { QuoteDisplay } from '@/components/achievements/QuoteDisplay';
import { StreakDisplay } from '@/components/achievements/StreakDisplay';

// Import Calendar Component
import CalendarViewNew from '@/components/calendar/CalendarViewNew';
import Colors from '@/lib/constants/Colors';

// Simple Separator Component
const Separator = () => <View style={styles.separator} />;

// Performance Tab Content
const PerformanceTabContent = React.memo(() => {
  return (
    <>
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
          <View style={styles.glassEffect} />
          <>
            <StreakDisplay />
            <Separator />
            <QuoteDisplay />
            <Separator />
            <AchievementsList />
          </>
        </View>
      </View>
    </>
  );
});

// Calendar Tab Content
const CalendarTabContent = React.memo(() => {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Calendar</Text>
        <Text style={styles.sectionSubtitle}>
          Track your habit completion streaks
        </Text>
        {/* <CalendarView /> */}
        <CalendarViewNew />
      </View>
    </>
  );
});

const StatsScreen = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text
            style={[styles.tabText, activeTab === 0 && styles.activeTabText]}
          >
            Performance
          </Text>
          {activeTab === 0 && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text
            style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
          >
            Calendar
          </Text>
          {activeTab === 1 && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 0 ? <PerformanceTabContent /> : <CalendarTabContent />}
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
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.bgDark,
  },
  activeTabText: {
    color: Colors.bgDark,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    backgroundColor: Colors.bgDark,
    borderRadius: 1.5,
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
    backgroundColor: '#FFFFFF', // Solid background color
    borderRadius: 18,
    paddingTop: 15,
    paddingBottom: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden', // Important for the BlurView
  },
  glassEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
