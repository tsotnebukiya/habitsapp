import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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
    await WebBrowser.openBrowserAsync('https://www.gymleadai.app/terms');
  };
  const handlePrivacy = async () => {
    await WebBrowser.openBrowserAsync('https://www.gymleadai.app/privacy');
  };

  const handleShare = async () => {
    try {
      const message = 'Check out this amazing app!';
      const url = 'https://apps.apple.com/ge/app/mercury-weather/id1621800675';

      await Share.share({
        message: `${message} ${url}`,
        url: url,
        title: 'Habits Lab',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {
          paddingTop: insets.top + 17,
          paddingBottom: 20,
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
            <Text style={styles.itemText}>Notifications</Text>
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
            <Text style={styles.itemText}>Send Feadback</Text>
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
            <Text style={styles.itemText}>Share</Text>
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
            <Text style={styles.itemText}>Privacy Policy</Text>
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
            <Text style={styles.itemText}>Terms of service</Text>
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
            <Text style={styles.itemText}>Language</Text>
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
});

export default SettingsScreen;
