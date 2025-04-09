// app/onboarding/OnboardingLogin.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';

import { supabase } from '@/lib/utils/supabase';
import { newOnboardingStyles, onboardingGradient } from './newOnboardingStyles';
import Colors from '@/lib/constants/Colors';
import { useUserProfileStore } from '@/lib/interfaces/user_profile';

const ONBOARDING_STEPS = [
  '/onboarding/OnboardingIntro',
  '/onboarding/OnboardingSignUp',
  // Add other steps as needed
];

function OnboardingLogin() {
  const router = useRouter();
  const { setProfile, updateProfile } = useUserProfileStore();

  const currentIndex = ONBOARDING_STEPS.indexOf('/onboarding/OnboardingSignUp');

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.email'],
    iosClientId: '<IOS_CLIENT_ID>.apps.googleusercontent.com',
  });

  const handleLoginSuccess = (userData: any) => {
    setProfile({
      ...userData,
      displayName: userData.display_name,
      updatedAt: dayjs().toISOString(),
      createdAt: userData.created_at || dayjs().toISOString(),
      onboardingComplete: true,
      bodyScore: userData.body_score,
      mindScore: userData.mind_score,
      heartScore: userData.heart_score,
      spiritScore: userData.spirit_score,
      workScore: userData.work_score,
    });
    router.replace('/(tabs)');
  };

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error, data } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;
        handleLoginSuccess(userData);
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Toast.show({
          type: 'error',
          text1: 'Error occurred signing in with Apple.',
          text2: 'Please try again.',
        });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });

        if (error) throw error;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;
        handleLoginSuccess(userData);
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        const errorMessage =
          error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
            ? 'Google Play Services not available. Try another login method.'
            : 'Error occurred signing in with Google. Please try again.';

        Toast.show({
          type: 'error',
          text1: errorMessage,
        });
      }
    }
  };

  return (
    <LinearGradient
      colors={onboardingGradient}
      style={newOnboardingStyles.container}
    >
      <View style={newOnboardingStyles.contentContainer}>
        <Text style={newOnboardingStyles.title}>Login</Text>

        <TouchableOpacity
          style={[newOnboardingStyles.button, { justifyContent: 'center' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/onboarding/OnboardingEmailLoginModal');
          }}
        >
          <FontAwesome6
            name="envelope"
            size={18}
            color={Colors.light.text.primary}
            style={newOnboardingStyles.buttonIcon}
          />
          <Text style={newOnboardingStyles.buttonText}>
            Continue with Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[newOnboardingStyles.button, { justifyContent: 'center' }]}
          onPress={handleGoogleSignIn}
        >
          <FontAwesome6
            name="google"
            size={18}
            color={Colors.light.text.primary}
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
          style={[newOnboardingStyles.button, { height: 55 }]}
          onPress={handleAppleSignIn}
        />
      </View>

      <View style={newOnboardingStyles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={newOnboardingStyles.backButton}
        >
          <FontAwesome6
            name="chevron-left"
            size={20}
            color={Colors.shared.primary[500]}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

export default OnboardingLogin;
