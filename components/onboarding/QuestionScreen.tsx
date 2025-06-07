import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, fontWeights } from '@/lib/constants/ui';
import type { OnboardingItem } from '@/lib/stores/onboardingStore';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ACTIVE_OPACITY_WHITE } from '../shared/config';

const { width: screenWidth } = Dimensions.get('window');

export default function QuestionScreen({ item }: { item: OnboardingItem }) {
  const { t } = useTranslation();
  const { setAnswer, getAnswer } = useOnboardingStore();
  const existingAnswer = getAnswer(item.id) as number | undefined;

  // Get translated question text
  const questionText = item.questionKey
    ? t(item.questionKey as any)
    : item.question || '';

  // Get translated options
  const translatedOptions = item.optionKeys
    ? item.optionKeys.map((key) => t(key as any))
    : item.options || [];

  const handleOptionSelect = (option: string, index: number) => {
    // Store the option index instead of the translated text
    setAnswer(item.id, index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{questionText}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {translatedOptions.map((option, index) => {
          const isSelected = existingAnswer === index;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={ACTIVE_OPACITY_WHITE}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => handleOptionSelect(option, index)}
            >
              <SymbolView
                name={(item.optionIcons?.[index] || 'circle.fill') as any}
                size={20}
                style={{ opacity: isSelected ? 1 : 0.7 }}
                tintColor={isSelected ? colors.primary : colors.text}
              />
              <Text style={[styles.optionText]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  optionsContainer: {
    gap: 8,
  },
  option: {
    ...colors.dropShadow,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedOption: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    fontFamily: fontWeights.regular,
  },
});
