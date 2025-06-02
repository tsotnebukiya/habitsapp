// app/onboarding/OnboardingSignUp.tsx
import useHabitsStore from '@/lib/habit-store/store';
import useUserProfileStore from '@/lib/stores/user_profile';
import { dateUtils } from '@/lib/utils/dayjs';
import { GOOGLE_SIGN_IN_IOS_CLIENT_ID } from '@/safe_constants';
import { supabase } from '@/supabase/client';
import { FontAwesome6 } from '@expo/vector-icons';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const OnboardingSignUp = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { profile, setProfile, updateProfile, completeOnboarding } =
    useUserProfileStore();

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.email'],
    iosClientId: GOOGLE_SIGN_IN_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (profile?.id) {
      nextStep();
    }
  }, [profile?.id]);

  const nextStep = () => {};

  const backStep = () => {};

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (!error && user) {
          const userData = {
            id: user.id,
            email: user.email!,
            display_name: user.email?.split('@')[0] || '', // Default to email username
            created_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
            updated_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
            cat1: 50,
            cat2: 50,
            cat3: 50,
            cat4: 50,
            cat5: 50,
          };

          const { error: InsertError } = await supabase
            .from('users')
            .upsert(userData);

          if (InsertError) {
            console.error('Error upserting user data:', InsertError);
            Toast.show({
              type: 'error',
              text1: 'Error occurred signing in.',
              text2: 'Please try again.',
            });
          } else {
            const currentTimezone = dateUtils.getCurrentTimezone();
            // Convert snake_case to camelCase for the application state
            setProfile({
              id: userData.id,
              email: userData.email,
              display_name: userData.display_name,
              updated_at: userData.updated_at,
              created_at: userData.created_at,
              onboarding_complete: true,
              cat1: userData.cat1,
              cat2: userData.cat2,
              cat3: userData.cat3,
              cat4: userData.cat4,
              cat5: userData.cat5,
              allow_streak_notifications: false,
              allow_daily_update_notifications: false,
              date_of_birth: null,
              push_token: null,
              timezone: currentTimezone,
            });

            // Initialize achievements
            const initialAchievements = {
              id: userData.id,
              user_id: userData.id,
              cat1: userData.cat1,
              cat2: userData.cat2,
              cat3: userData.cat3,
              cat4: userData.cat4,
              cat5: userData.cat5,
              current_streak: 0,
              max_streak: 0,
              streak_achievements: {},
              created_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
              updated_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
            };

            useHabitsStore.getState().setAchievements(initialAchievements);

            nextStep();
          }
        }
      }
    } catch (e: any) {
      console.error('Apple Sign In error:', e);
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // User canceled sign-in flow
        return;
      }
      Toast.show({
        type: 'error',
        text1: 'Error occurred signing in with Apple.',
        text2: e.message || 'Please try again.',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          const userData = {
            id: data.user.id,
            email: data.user.email!,
            display_name: data.user.email?.split('@')[0]!, // Default to email username
            created_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
            updated_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
            cat1: 50,
            cat2: 50,
            cat3: 50,
            cat4: 50,
            cat5: 50,
          };

          const { error: InsertError } = await supabase
            .from('users')
            .upsert(userData);

          if (InsertError) {
            throw InsertError;
          }

          const currentTimezone = dateUtils.getCurrentTimezone();
          // Convert snake_case to camelCase for the application state
          setProfile({
            id: userData.id,
            email: userData.email,
            display_name: userData.display_name,
            updated_at: userData.updated_at,
            created_at: userData.created_at,
            onboarding_complete: true,
            cat1: userData.cat1,
            cat2: userData.cat2,
            cat3: userData.cat3,
            cat4: userData.cat4,
            cat5: userData.cat5,
            allow_streak_notifications: false,
            allow_daily_update_notifications: false,
            date_of_birth: null,
            push_token: null,
            timezone: currentTimezone,
          });

          // Initialize achievements
          const initialAchievements = {
            id: userData.id,
            user_id: userData.id,
            cat1: userData.cat1,
            cat2: userData.cat2,
            cat3: userData.cat3,
            cat4: userData.cat4,
            cat5: userData.cat5,
            current_streak: 0,
            max_streak: 0,
            streak_achievements: {},
            created_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
            updated_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
          };

          useHabitsStore.getState().setAchievements(initialAchievements);

          nextStep();
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return; // User cancelled login flow
      }

      let errorMessage = 'Error occurred signing in with Google.';
      if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign In interrupted.';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available.';
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: 'Please try again.',
      });
    }
  };

  return (
    <View>
      <View>
        <Text>Sign Up</Text>
        <Text>You're almost done!</Text>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/OnboardingEmailSignupModal')}
        >
          <Text>Continue with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoogleSignIn}>
          <FontAwesome6 name="google" size={18} color="black" />
          <Text>Continue with Google</Text>
        </TouchableOpacity>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={
            AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
          }
          cornerRadius={25}
          onPress={handleAppleSignIn}
        />

        <Text>
          By continuing, you agree to our <Text>Terms and Conditions</Text> and
          confirm you have read our <Text>Privacy Policy</Text>.
        </Text>
      </View>

      <View>
        <TouchableOpacity onPress={backStep}>
          <FontAwesome6 name="chevron-left" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingSignUp;
