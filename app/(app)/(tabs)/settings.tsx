import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import { useUserProfileStore } from '@/lib/stores/user_profile';
import { supabase } from '@/supabase/client';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile, clearProfile } = useUserProfileStore();
  const clearHabitsData = useHabitsStore((state) => state.clearAllData);
  const clearAppData = useAppStore((state) => state.clearAllData);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotifications = () => {
    router.push('/settings/notifications');
  };
  const handleFeedback = () => {
    router.push('/settings/feedback');
  };
  const handleLanguage = () => {
    router.push('/settings/language');
  };
  const handleTerms = async () => {
    await WebBrowser.openBrowserAsync('https://www.habitslab.app/terms');
  };
  const handlePrivacy = async () => {
    await WebBrowser.openBrowserAsync('https://www.habitslab.app/privacy');
  };

  const handleShare = async () => {
    try {
      const message = 'Check out Habits Lab - the best habit tracking app!';

      const iosUrl = 'https://apps.apple.com/app/habitsapp/id6745717349';
      const shareUrl = iosUrl;

      await Share.share({
        message: `${message} ${shareUrl}`,
        url: shareUrl,
        title: 'Habits Lab',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(t('settings.signOut.title'), t('settings.signOut.message'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('settings.signOut.confirm'),
        style: 'destructive',
        onPress: confirmSignOut,
      },
    ]);
  };

  const confirmSignOut = async () => {
    try {
      // Clear all local data stores
      clearProfile();
      clearHabitsData();
      clearAppData();

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Show success message
      Toast.show({
        type: 'success',
        text1: t('settings.signOut.success'),
      });

      // Navigate to onboarding
      router.replace('/onboarding/OnboardingIntro');
    } catch (error: any) {
      console.error('Error signing out:', error);

      Toast.show({
        type: 'error',
        text1: t('settings.signOut.error'),
        text2: error.message || t('errors.generic'),
      });
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount.title'),
      t('settings.deleteAccount.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.deleteAccount.confirm'),
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!profile?.id) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: t('settings.deleteAccount.noUser'),
      });
      return;
    }
    setIsDeleting(true);
    try {
      // Get current session to pass to Edge Function
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Call the delete-user Edge Function with proper auth header
      const { error } = await supabase.functions.invoke('delete-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // Clear all local data stores
      clearProfile();
      clearHabitsData();
      clearAppData();

      // Clear local session (user is already deleted from auth)
      await supabase.auth.signOut({ scope: 'local' });
      setIsDeleting(false);
      // Show success message
      Toast.show({
        type: 'success',
        text1: t('settings.deleteAccount.success'),
      });

      // Navigate to onboarding
      router.replace('/onboarding/OnboardingIntro');
    } catch (error: any) {
      setIsDeleting(false);
      console.error('Error deleting account:', error);

      Toast.show({
        type: 'error',
        text1: t('settings.deleteAccount.error'),
        text2: error.message || t('errors.generic'),
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {
          paddingTop: insets.top + 17,
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t('settings.title')}</Text>
      <View style={styles.mainContainer}>
        <View style={styles.subContainer}>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handleNotifications}
          >
            <Icon
              source={require('@/assets/icons/notifications.png')}
              size={24}
              color={colors.habitColors.grapePurple}
            />
            <Text style={styles.itemText}>{t('settings.notifications')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handleFeedback}
          >
            <Icon
              source={require('@/assets/icons/feedback.png')}
              size={24}
              color={colors.habitColors.amberYellow}
            />
            <Text style={styles.itemText}>{t('settings.sendFeedback')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handleShare}
          >
            <Icon
              source={require('@/assets/icons/share.png')}
              size={24}
              color={'#42A5F5'}
            />
            <Text style={styles.itemText}>{t('settings.share')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handlePrivacy}
          >
            <Icon
              source={require('@/assets/icons/file.png')}
              size={24}
              color={colors.habitColors.tealGreen}
            />
            <Text style={styles.itemText}>{t('settings.privacyPolicy')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handleTerms}
          >
            <Icon
              source={require('@/assets/icons/file.png')}
              size={24}
              color={colors.habitColors.indigoBlue}
            />
            <Text style={styles.itemText}>{t('settings.termsOfService')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handleLanguage}
          >
            <Icon
              source={require('@/assets/icons/translate.png')}
              size={24}
              color={colors.habitColors.amethystPurple}
            />
            <Text style={styles.itemText}>{t('settings.language')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.item}
            onPress={handleSignOut}
          >
            <Icon
              source={require('@/assets/icons/x-close.png')}
              size={24}
              color={'#FF6B6B'}
            />
            <Text style={styles.itemText}>{t('settings.signOut.button')}</Text>
            <View style={styles.containerRight}>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={18}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Account Button - At the bottom of ScrollView */}
      <TouchableOpacity
        style={styles.deleteAccount}
        onPress={handleDeleteAccount}
        disabled={isDeleting}
      >
        <Text style={styles.deleteAccountText}>
          {t('settings.deleteAccount.button')}
        </Text>
        {isDeleting && <ActivityIndicator size="small" color={'#D80027'} />}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  contentContainerStyle: { paddingHorizontal: 18 },
  title: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 24,
  },
  mainContainer: {
    ...colors.dropShadow,
  },
  subContainer: {
    backgroundColor: colors.border,
    gap: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 16.5,
    gap: 8.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    fontFamily: fontWeights.medium,
    color: colors.text,
    minWidth: 80,
  },
  deleteAccount: {
    marginTop: 60,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  deleteAccountText: {
    fontSize: 14,
    fontFamily: fontWeights.bold,
    color: '#D80027',
  },
});

export default SettingsScreen;
