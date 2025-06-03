// app/onboarding/OnboardingLogin.tsx
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import Toast from 'react-native-toast-message';

import { ACTIVE_OPACITY_WHITE } from '@/components/shared/config';
import { languages } from '@/lib/constants/languages';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { UserProfile, useUserProfileStore } from '@/lib/stores/user_profile';
import { GOOGLE_SIGN_IN_IOS_CLIENT_ID } from '@/safe_constants';
import { supabase } from '@/supabase/client';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function OnboardingLogin() {
  const inset = useSafeAreaInsets();
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const { setProfile, completeOnboarding } = useUserProfileStore();

  const handleLanguage = () => {
    router.push('/language');
  };

  const handleBack = () => {
    router.back();
  };

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.email'],
    iosClientId: GOOGLE_SIGN_IN_IOS_CLIENT_ID,
  });

  const handleLoginSuccess = (userData: UserProfile) => {
    // Set the profile first
    setProfile(userData);
    // Then complete onboarding (this will handle the Supabase sync)
    completeOnboarding();
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
      console.log(error);
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

  const handleFacebookSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (data) {
        const { error, data: authData } = await supabase.auth.signInWithIdToken(
          {
            provider: 'facebook',
            token: data.accessToken,
          }
        );

        if (error) throw error;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) throw userError;
        handleLoginSuccess(userData);
      }
    } catch (error: any) {
      console.log('Facebook sign-in error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error occurred signing in with Facebook.',
        text2: 'Please try again.',
      });
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/onboarding/gradient.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View
        style={[
          styles.container,
          { paddingTop: inset.top + 20, paddingBottom: inset.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={ACTIVE_OPACITY_WHITE}
          >
            <Icon
              source={require('@/assets/icons/chevron-left.png')}
              size={18}
              color="black"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLanguage}
            style={styles.languageButton}
            activeOpacity={ACTIVE_OPACITY_WHITE}
          >
            <Image
              source={languages[currentLanguage].icon}
              style={styles.languageIcon}
            />
            <Text style={styles.languageLabel}>
              {languages[currentLanguage].label}
            </Text>
          </TouchableOpacity>
        </View>
        <Image
          width={130}
          height={130}
          source={require('@/assets/onboarding/logo.png')}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.appName1}>Habits</Text>
          <Text style={styles.appName2}>Lab</Text>
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.title}>{t('onboarding.login.title')}</Text>
          <Text style={styles.subTitle}>{t('onboarding.login.subtitle')}</Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={ACTIVE_OPACITY_WHITE}
            onPress={handleGoogleSignIn}
          >
            <Image source={require('@/assets/onboarding/google.png')} />
            <Text style={styles.buttonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={ACTIVE_OPACITY_WHITE}
            onPress={handleAppleSignIn}
          >
            <Image source={require('@/assets/onboarding/apple.png')} />
            <Text style={styles.buttonText}>Apple ID</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={ACTIVE_OPACITY_WHITE}
            onPress={handleFacebookSignIn}
          >
            <Image source={require('@/assets/onboarding/facebook.png')} />
            <Text style={[styles.buttonText, styles.facebookText]}>
              Facebook
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButton: {
    backgroundColor: 'white',
    borderRadius: 70,
    padding: 8,
    gap: 8,
    flexDirection: 'row',
  },
  languageIcon: {
    width: 18,
    height: 18,
  },
  languageLabel: {
    fontFamily: fontWeights.medium,
    fontSize: 13,
    color: colors.text,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },
  appName1: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.primary,
  },
  appName2: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.secondary,
  },
  bottomContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 14,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: colors.text,
    marginBottom: 42,
  },
  button: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  facebookText: {
    color: '#3D8EFF',
  },
});

export default OnboardingLogin;
