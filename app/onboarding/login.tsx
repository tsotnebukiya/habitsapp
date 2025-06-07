// app/onboarding/OnboardingLogin.tsx
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { ACTIVE_OPACITY_WHITE } from '@/components/shared/config';
import { languages } from '@/lib/constants/languages';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { useUserProfileStore } from '@/lib/stores/user_profile';
import { dateUtils } from '@/lib/utils/dayjs';
import { GOOGLE_SIGN_IN_IOS_CLIENT_ID } from '@/safe_constants';
import { supabase } from '@/supabase/client';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function OnboardingLogin() {
  const inset = useSafeAreaInsets();
  const { t, currentLanguage } = useTranslation();
  const matrixScores = useOnboardingStore.getState().getMatrixScores();
  const router = useRouter();
  const { setProfile } = useUserProfileStore();
  const currentAppLanguage = useAppStore((state) => state.currentLanguage);
  const [loading, setLoading] = useState(false);
  const handleLanguage = () => {
    router.push('/language');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // No previous screen (came from smart routing), go to intro
      router.replace('/onboarding/intro');
    }
  };

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.email'],
    iosClientId: GOOGLE_SIGN_IN_IOS_CLIENT_ID,
  });

  // Unified auth logic that handles both sign-in and sign-up
  const handleUnifiedAuth = async (authData: any, provider: string) => {
    try {
      if (!authData.user) {
        throw new Error(t('onboarding.login.errors.noUserData'));
      }

      // Check if user already exists first (foolproof approach)
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      // Handle real fetch errors (not "not found" which is expected for new users)
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        setProfile(existingUser);
        router.replace('/(tabs)');
      } else {
        const currentTimezone = dateUtils.getCurrentTimezone();
        const userData = {
          id: authData.user.id,
          email: authData.user.email!,
          display_name: authData.user.email?.split('@')[0] || '',
          created_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
          updated_at: dateUtils.toServerDateTime(dateUtils.nowUTC()),
          cat1: matrixScores.cat1,
          cat2: matrixScores.cat2,
          cat3: matrixScores.cat3,
          cat4: matrixScores.cat4,
          cat5: matrixScores.cat5,
          preferred_language: currentAppLanguage,
          timezone: currentTimezone,
          onboarding_complete: true,
          allow_streak_notifications: false,
          allow_daily_update_notifications: false,
          date_of_birth: null,
          push_token: null,
        };
        const { error: insertError } = await supabase
          .from('users')
          .insert(userData);
        if (insertError) throw insertError;

        setProfile(userData);

        // Initialize achievements for new user only
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
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        };

        useHabitsStore.getState().setAchievements(initialAchievements);
        router.push('/onboarding/notifications');
      }
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      Toast.show({
        type: 'error',
        text1: t('onboarding.login.errors.generic', { provider }),
        text2: error.message || t('onboarding.login.errors.tryAgain'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

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
        await handleUnifiedAuth(data, 'Apple');
      }
    } catch (e: any) {
      setLoading(false);

      if (e.code === 'ERR_REQUEST_CANCELED') {
        return; // User canceled sign-in flow
      }
      console.error('Apple Sign In error:', e);
      Toast.show({
        type: 'error',
        text1: t('onboarding.login.errors.apple'),
        text2: e.message || t('onboarding.login.errors.tryAgain'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) throw error;
        await handleUnifiedAuth(data, 'Google');
      }
    } catch (error: any) {
      setLoading(false);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return; // User cancelled login flow
      }

      let errorMessage = t('onboarding.login.errors.google');
      if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = t('onboarding.login.errors.googleInterrupted');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = t('onboarding.login.errors.googlePlayServices');
      }

      console.error('Google Sign In error:', error);
      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: t('onboarding.login.errors.tryAgain'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          skipBrowserRedirect: true,
          scopes: 'public_profile email',
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'habitsapp://', // Your app scheme from app.config.ts
          {
            showInRecents: false,
            dismissButtonStyle: 'close',
          }
        );

        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const fragment = url.hash.substring(1);
          const params = new URLSearchParams(fragment);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            // Set the session with the tokens
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

            if (sessionError) throw sessionError;
            await handleUnifiedAuth(sessionData, 'Facebook');
          } else {
            throw new Error(t('onboarding.login.errors.missingTokens'));
          }
        } else if (result.type === 'cancel') {
          return; // User cancelled login flow
        }
      }
    } catch (error: any) {
      setLoading(false);

      console.error('Facebook Sign In error:', error);
      Toast.show({
        type: 'error',
        text1: t('onboarding.login.errors.facebook'),
        text2: error.message || t('onboarding.login.errors.tryAgain'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/onboarding/gradient.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
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
      </ScrollView>

      {/* Loading Modal */}
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t('onboarding.login.loading')}
            </Text>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: colors.text,
    marginTop: 10,
  },
});

export default OnboardingLogin;
