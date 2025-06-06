import React, { useState } from 'react';
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
import { ACTIVE_OPACITY_WHITE } from '../shared/config';

const { width: screenWidth } = Dimensions.get('window');

export default function QuestionScreen({ item }: { item: OnboardingItem }) {
  const { setAnswer, getAnswer } = useOnboardingStore();
  const existingAnswer = getAnswer(item.id) as string | undefined;
  const [selectedOption, setSelectedOption] = useState<string>(
    existingAnswer || ''
  );

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setAnswer(item.id, option);
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{item.question}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {item.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={ACTIVE_OPACITY_WHITE}
            style={[
              styles.option,
              selectedOption === option && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(option)}
          >
            <SymbolView
              name="rectangle.stack.fill"
              size={20}
              tintColor={colors.secondary}
            />
            <Text style={[styles.optionText]}>{option}</Text>
          </TouchableOpacity>
        ))}
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
