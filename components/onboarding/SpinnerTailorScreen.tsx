import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useOnboardingStore,
  type OnboardingItem,
  type SpinnerData,
} from '@/lib/stores/onboardingStore';

const { width: screenWidth } = Dimensions.get('window');

interface SpinnerTailorScreenProps {
  item: OnboardingItem;
  onNext: () => void;
  onPrevious: () => void;
  isFirstScreen: boolean;
  isLastScreen: boolean;
}

const PREFERENCES = [
  {
    id: 'simple-interface',
    name: 'Simple Interface',
    icon: '🎯',
    description: 'Clean, minimal design',
  },
  {
    id: 'detailed-tracking',
    name: 'Detailed Tracking',
    icon: '📊',
    description: 'Charts and analytics',
  },
  {
    id: 'social-features',
    name: 'Social Features',
    icon: '👥',
    description: 'Share progress with friends',
  },
  {
    id: 'gamification',
    name: 'Gamification',
    icon: '🏆',
    description: 'Points, badges, and rewards',
  },
  {
    id: 'reminders',
    name: 'Smart Reminders',
    icon: '⏰',
    description: 'Gentle nudges and notifications',
  },
  {
    id: 'flexibility',
    name: 'Flexibility',
    icon: '🔄',
    description: 'Easily adjust habits and goals',
  },
  {
    id: 'science-based',
    name: 'Science-Based',
    icon: '🧠',
    description: 'Evidence-backed recommendations',
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    icon: '⚡',
    description: 'Fast habit logging',
  },
];

export default function SpinnerTailorScreen({
  item,
  onNext,
  onPrevious,
  isFirstScreen,
  isLastScreen,
}: SpinnerTailorScreenProps) {
  const { setAnswer, getAnswer } = useOnboardingStore();
  const existingAnswer = getAnswer(item.id) as SpinnerData | undefined;

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    existingAnswer?.selectedPreferences || []
  );

  const handlePreferenceToggle = (preferenceId: string) => {
    let newPreferences: string[];

    if (selectedPreferences.includes(preferenceId)) {
      // Remove preference
      newPreferences = selectedPreferences.filter((id) => id !== preferenceId);
    } else {
      // Add preference (max 4 selections)
      if (selectedPreferences.length < 4) {
        newPreferences = [...selectedPreferences, preferenceId];
      } else {
        return; // Don't allow more than 4 selections
      }
    }

    setSelectedPreferences(newPreferences);
    setAnswer(item.id, { selectedPreferences: newPreferences } as SpinnerData);
  };

  const canProceed = selectedPreferences.length >= 2; // Minimum 2 preferences

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Tailor Your Experience</Text>
          <Text style={styles.subtitle}>
            Choose 2-4 features that matter most to you. We'll customize the app
            to match your preferences.
          </Text>
        </View>

        {/* Selection Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {selectedPreferences.length}/4 selected
          </Text>
          {selectedPreferences.length < 2 && (
            <Text style={styles.counterHint}>
              Select at least 2 preferences
            </Text>
          )}
        </View>

        {/* Preferences Grid */}
        <View style={styles.preferencesContainer}>
          {PREFERENCES.map((preference) => {
            const isSelected = selectedPreferences.includes(preference.id);
            const isDisabled = !isSelected && selectedPreferences.length >= 4;

            return (
              <TouchableOpacity
                key={preference.id}
                style={[
                  styles.preferenceOption,
                  isSelected && styles.selectedPreference,
                  isDisabled && styles.disabledPreference,
                ]}
                onPress={() => handlePreferenceToggle(preference.id)}
                disabled={isDisabled}
              >
                <Text style={styles.preferenceIcon}>{preference.icon}</Text>
                <Text
                  style={[
                    styles.preferenceName,
                    isSelected && styles.selectedPreferenceText,
                    isDisabled && styles.disabledPreferenceText,
                  ]}
                >
                  {preference.name}
                </Text>
                <Text
                  style={[
                    styles.preferenceDescription,
                    isSelected && styles.selectedPreferenceText,
                    isDisabled && styles.disabledPreferenceText,
                  ]}
                >
                  {preference.description}
                </Text>

                {/* Selection indicator */}
                <View
                  style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectedIndicator,
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Benefits preview */}
        {selectedPreferences.length >= 2 && (
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>
              Your personalized experience will include:
            </Text>
            <View style={styles.benefitsList}>
              {selectedPreferences.slice(0, 3).map((prefId) => {
                const preference = PREFERENCES.find((p) => p.id === prefId);
                return preference ? (
                  <Text key={prefId} style={styles.benefitItem}>
                    {preference.icon} {preference.name}
                  </Text>
                ) : null;
              })}
              {selectedPreferences.length > 3 && (
                <Text style={styles.benefitItem}>
                  ✨ And {selectedPreferences.length - 3} more feature
                  {selectedPreferences.length - 3 > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
  },
  titleContainer: {
    paddingTop: 40,
    marginBottom: 32,
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
  counterContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  counterHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  preferenceOption: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minHeight: 140,
    position: 'relative',
  },
  selectedPreference: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  disabledPreference: {
    opacity: 0.5,
  },
  preferenceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  preferenceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedPreferenceText: {
    color: '#3B82F6',
  },
  disabledPreferenceText: {
    color: '#9CA3AF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  benefitsContainer: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
