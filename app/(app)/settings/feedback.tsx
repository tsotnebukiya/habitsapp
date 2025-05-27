import { colors, fontWeights } from '@/lib/constants/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const { submitFeedback, isLoading, isSuccess, resetSuccess } = useFeedback();
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      await submitFeedback(message);
      setMessage('');
    } catch (error: any) {
      Alert.alert(
        'Unable to Send Feedback',
        'Unable to send feedback at the moment. Please try again later.'
      );
    }
  };

  const handleClose = () => {
    if (isSuccess) resetSuccess();
    router.back();
  };

  const isValid = message.trim().length >= MIN_LENGTH;
  const charCount = message.length;

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacing} />
          <Text style={styles.heading}>Feedback Sent!</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon
              source={require('@/assets/icons/x-close.png')}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successMessage}>
            Your feedback has been sent successfully. We appreciate your input
            and will review it carefully!
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => {
              resetSuccess();
              setMessage('');
            }}
          >
            <Text style={styles.successButtonText}>Send More Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerSpacing} />
        <Text style={styles.heading}>Send Feedback</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon
            source={require('@/assets/icons/x-close.png')}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Feedback</Text>
            <Text style={styles.description}>
              Tell us what you think, report a bug, or suggest a feature. We
              read every message!
            </Text>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your feedback here..."
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={MAX_LENGTH}
              textAlignVertical="top"
            />
            <View style={styles.charCountContainer}>
              <Text
                style={[
                  styles.charCount,
                  {
                    color:
                      charCount < MIN_LENGTH
                        ? colors.habitColors.salmonRed
                        : colors.textLight,
                  },
                ]}
              >
                {charCount}/{MAX_LENGTH}
              </Text>
              {charCount < MIN_LENGTH && (
                <Text style={styles.minLengthText}>
                  Minimum {MIN_LENGTH} characters
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValid || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Send Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    marginBottom: 20,
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    ...colors.dropShadow,
  },
  heading: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    textAlign: 'center',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...colors.dropShadow,
  },
  label: {
    fontSize: 14,
    fontFamily: fontWeights.medium,
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    fontFamily: fontWeights.regular,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 18,
  },
  textInput: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    fontFamily: fontWeights.regular,
  },
  minLengthText: {
    fontSize: 12,
    fontFamily: fontWeights.regular,
    color: '#ff4444',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...colors.dropShadow,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: fontWeights.semibold,
    color: 'white',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: fontWeights.regular,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...colors.dropShadow,
  },
  successButtonText: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    color: 'white',
  },
});
