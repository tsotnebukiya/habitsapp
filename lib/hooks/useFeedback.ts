import { supabase } from '@/supabase/client';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Platform } from 'react-native';
import useUserProfileStore from '../stores/user_profile';

export function useFeedback() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const userId = useUserProfileStore((state) => state.profile?.id);

  const submitFeedback = async (message: string) => {
    if (!message.trim() || message.length < 10) {
      throw new Error('Feedback must be at least 10 characters');
    }

    if (message.length > 500) {
      throw new Error('Feedback must be less than 500 characters');
    }

    setIsLoading(true);
    try {
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        device: Platform.select({
          ios: 'iOS Device',
          android: 'Android Device',
          default: 'Unknown',
        }),
      };

      const { data, error } = await supabase.functions.invoke('email-resend', {
        body: {
          message: message.trim(),
          deviceInfo,
          appVersion: Constants.expoConfig?.version || '1.0.0',
          userId: userId,
        },
      });
      console.log(error);
      if (error) throw error;

      setIsSuccess(true);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSuccess = () => setIsSuccess(false);

  return {
    submitFeedback,
    isLoading,
    isSuccess,
    resetSuccess,
  };
}
