import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { OnboardingItem } from '@/lib/stores/onboardingStore';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

const { width: screenWidth } = Dimensions.get('window');

interface QuestionScreenProps {
  item: OnboardingItem;
  onNext: () => void;
  onPrevious: () => void;
  isFirstScreen: boolean;
  isLastScreen: boolean;
}

export default function QuestionScreen({
  item,
  onNext,
  onPrevious,
  isFirstScreen,
  isLastScreen,
}: QuestionScreenProps) {
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
      <View style={styles.content}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{item.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {item.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedOption === option && styles.selectedOption,
              ]}
              onPress={() => handleOptionSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
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
  questionContainer: {
    marginBottom: 40,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
