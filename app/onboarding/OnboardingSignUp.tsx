// app/onboarding/OnboardingSignUp.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';
import { newOnboardingStyles, onboardingGradient } from './newOnboardingStyles';
import useUserProfileStore from '../../lib/interfaces/user_profile';
import { GOOGLE_SIGN_IN_IOS_CLIENT_ID } from '../../safe_constants';
import { ONBOARDING_STEPS } from './OnboardingSteps';

const OnboardingSignUp = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { profile, setProfile, updateProfile, completeOnboarding } =
    useUserProfileStore();

  const currentIndex = ONBOARDING_STEPS.indexOf('/onboarding/OnboardingSignUp');

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.email'],
    iosClientId: GOOGLE_SIGN_IN_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (profile?.id) {
      nextStep();
    }
  }, [profile?.id]);

  const nextStep = () => {
    if (profile?.id) {
      posthog?.identify(profile.id, {
        email: profile.email,
      });
      posthog?.capture('signup_successful', {
        id: profile.id,
        email: profile.email,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Find the next step in the onboarding flow
    const nextStepIndex = currentIndex + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      router.push(ONBOARDING_STEPS[nextStepIndex]);
    } else {
      // Fallback to tabs if we're somehow at the end
      router.replace('/(tabs)');
    }
  };

  const backStep = () => {
    if (currentIndex > 0) {
      router.push(ONBOARDING_STEPS[currentIndex - 1]);
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleAppleSignIn = async () => {
    try {
      console.log('Starting Apple Sign In process');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      console.log('Apple credential received:', credential);

      if (credential.identityToken) {
        console.log('Attempting to sign in with Supabase using Apple token');
        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        console.log('Supabase sign in response:', { error, user });

        if (!error && user) {
          const userData = {
            id: user.id,
            email: user.email!,
            display_name: user.email?.split('@')[0] || '', // Default to email username
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            body_score: 50,
            mind_score: 50,
            heart_score: 50,
            spirit_score: 50,
            work_score: 50,
          };
          console.log('Attempting to upsert user data:', userData);

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
            // Convert snake_case to camelCase for the application state
            setProfile({
              id: userData.id,
              email: userData.email,
              displayName: userData.display_name,
              updatedAt: userData.updated_at,
              createdAt: userData.created_at,
              onboardingComplete: true,
              bodyScore: userData.body_score,
              mindScore: userData.mind_score,
              heartScore: userData.heart_score,
              spiritScore: userData.spirit_score,
              workScore: userData.work_score,
            });
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            body_score: 50,
            mind_score: 50,
            heart_score: 50,
            spirit_score: 50,
            work_score: 50,
          };

          const { error: InsertError } = await supabase
            .from('users')
            .upsert(userData);

          if (InsertError) {
            throw InsertError;
          }

          // Convert snake_case to camelCase for the application state
          setProfile({
            id: userData.id,
            email: userData.email,
            displayName: userData.display_name,
            updatedAt: userData.updated_at,
            createdAt: userData.created_at,
            onboardingComplete: true,
            bodyScore: userData.body_score,
            mindScore: userData.mind_score,
            heartScore: userData.heart_score,
            spiritScore: userData.spirit_score,
            workScore: userData.work_score,
          });
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
    <LinearGradient
      colors={onboardingGradient}
      style={newOnboardingStyles.container}
    >
      <View style={newOnboardingStyles.contentContainer}>
        <Text style={newOnboardingStyles.title}>Sign Up</Text>
        <Text style={newOnboardingStyles.subtitle}>You're almost done!</Text>

        <TouchableOpacity
          style={{ ...newOnboardingStyles.button, justifyContent: 'center' }}
          onPress={() => router.push('/onboarding/OnboardingEmailSignupModal')}
        >
          <FontAwesome6
            name="envelope"
            size={18}
            color="black"
            style={newOnboardingStyles.buttonIcon}
          />
          <Text style={newOnboardingStyles.buttonText}>
            Continue with Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ ...newOnboardingStyles.button, justifyContent: 'center' }}
          onPress={handleGoogleSignIn}
        >
          <FontAwesome6
            name="google"
            size={18}
            color="black"
            style={newOnboardingStyles.buttonIcon}
          />
          <Text style={newOnboardingStyles.buttonText}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={
            AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
          }
          cornerRadius={25}
          style={{ ...newOnboardingStyles.button, height: 55 }}
          onPress={handleAppleSignIn}
        />

        <Text style={newOnboardingStyles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={newOnboardingStyles.termsLink}>
            Terms and Conditions
          </Text>{' '}
          and confirm you have read our{' '}
          <Text style={newOnboardingStyles.termsLink}>Privacy Policy</Text>.
        </Text>
      </View>

      <View style={newOnboardingStyles.buttonContainer}>
        <TouchableOpacity
          onPress={backStep}
          style={newOnboardingStyles.backButton}
        >
          <FontAwesome6 name="chevron-left" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default OnboardingSignUp;
