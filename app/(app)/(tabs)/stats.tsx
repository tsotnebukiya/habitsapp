import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { MatrixGrid } from '@/components/matrix/MatrixGrid';
import { useMatrix } from '@/lib/hooks/useMatrix';

// Import Achievement Components
import { StreakDisplay } from '@/components/achievements/StreakDisplay';
import { QuoteDisplay } from '@/components/achievements/QuoteDisplay';
import { AchievementsList } from '@/components/achievements/AchievementsList';

// Import Calendar Component
import CalendarView from '@/components/calendar/CalendarView';
import Colors from '@/lib/constants/Colors';

// Simple Separator Component
const Separator = () => <View style={styles.separator} />;

// Performance Tab Content
const PerformanceTabContent = React.memo(() => {
  const mountTime = useRef(Date.now());
  const [isMatrixVisible, setIsMatrixVisible] = useState(false);
  const [isAchievementsVisible, setIsAchievementsVisible] = useState(false);

  useEffect(() => {
    // Stagger the loading of components
    const matrixTimer = setTimeout(() => setIsMatrixVisible(true), 50);
    const achievementsTimer = setTimeout(
      () => setIsAchievementsVisible(true),
      100
    );

    return () => {
      clearTimeout(matrixTimer);
      clearTimeout(achievementsTimer);
    };
  }, []);

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
          {isAchievementsVisible && (
            <>
              <StreakDisplay />
              <Separator />
              <QuoteDisplay />
              <Separator />
              <AchievementsList />
            </>
          )}
        </View>
      </View>
    </>
  );
});

// Calendar Tab Content
const CalendarTabContent = React.memo(() => {
  const mountTime = useRef(Date.now());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;
    console.log(`Calendar tab mounted in ${mountDuration}ms`);

    // Delay calendar loading slightly
    const timer = setTimeout(() => setIsCalendarVisible(true), 50);

    return () => {
      clearTimeout(timer);
      const totalTime = Date.now() - mountTime.current;
      console.log(`Calendar tab total visible time: ${totalTime}ms`);
    };
  }, []);

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Calendar</Text>
        <Text style={styles.sectionSubtitle}>
          Track your habit completion streaks
        </Text>
        <CalendarView />
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
    color: Colors.light.text.secondary,
  },
  activeTabText: {
    color: Colors.shared.primary[500],
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    backgroundColor: Colors.shared.primary[500],
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
