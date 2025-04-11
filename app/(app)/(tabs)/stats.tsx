import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, View } from 'react-native';
import { MatrixGrid } from '@/components/matrix/MatrixGrid';
import { useMatrix } from '@/lib/hooks/useMatrix';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Import Achievement Components
import { StreakDisplay } from '@/components/achievements/StreakDisplay';
import { QuoteDisplay } from '@/components/achievements/QuoteDisplay';
import { AchievementsList } from '@/components/achievements/AchievementsList';
import { AchievementUnlockModal } from '@/components/achievements/AchievementUnlockModal';
import { useAchievementsStore } from '@/lib/stores/achievements_store';
import { getAchievementDetails } from '@/lib/utils/achievement_scoring';
import { Achievement } from '@/lib/constants/achievements';

// Simple Separator Component
const Separator = () => <View style={styles.separator} />;

const StatsScreen = () => {
  const { lastCalculated } = useMatrix();

  // Modal state and refs
  const achievementModalRef = useRef<BottomSheetModal>(null);
  const [unlockedAchievement, setUnlockedAchievement] =
    useState<Achievement | null>(null);

  // Get store state and actions
  const justUnlockedId = useAchievementsStore(
    (state) => state.justUnlockedAchievementId
  );
  const clearJustUnlocked = useAchievementsStore(
    (state) => state.clearJustUnlockedAchievement
  );

  // Effect to watch for unlocked achievement ID
  useEffect(() => {
    console.log(
      '[StatsScreen] useEffect triggered. justUnlockedId:',
      justUnlockedId
    );
    if (justUnlockedId !== null) {
      console.log('[StatsScreen] Found unlocked ID:', justUnlockedId);
      const details = getAchievementDetails(justUnlockedId);
      console.log('[StatsScreen] Fetched details:', details);
      if (details) {
        setUnlockedAchievement(details); // Store details for the modal
        // Add a small delay before presenting to allow ref to attach
        const timerId = setTimeout(() => {
          console.log(
            '[StatsScreen] Attempting to present modal (after delay). Ref:',
            achievementModalRef.current
          );
          achievementModalRef.current?.present(); // Present the modal
        }, 100); // 100ms delay

        // Cleanup function to clear timeout if component unmounts or ID changes
        return () => clearTimeout(timerId);
      } else {
        console.warn(
          '[StatsScreen] Could not get achievement details for ID:',
          justUnlockedId
        );
      }
    } else {
      console.log('[StatsScreen] justUnlockedId is null, doing nothing.');
    }
  }, [justUnlockedId]);

  // Callback for when the modal is dismissed
  const handleDismissModal = useCallback(() => {
    setUnlockedAchievement(null); // Clear local state
    clearJustUnlocked(); // Clear the trigger in the store
  }, [clearJustUnlocked]);

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

      {/* Achievement Unlock Modal - Rendered outside ScrollView */}
      <AchievementUnlockModal
        modalRef={achievementModalRef}
        achievement={unlockedAchievement}
        onDismiss={handleDismissModal}
      />
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
