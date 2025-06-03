// app/onboarding/OnboardingLogin.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Button from '@/components/shared/Button';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Notifications() {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/onboarding/gradient.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: inset.top + 20, paddingBottom: inset.bottom + 20 },
        ]}
      >
        <View>
          <View style={styles.notificationIconContainer}>
            <Image source={require('@/assets/icons/bell-03.png')} />
          </View>
          <Text style={styles.title}>
            Our <Text style={styles.titleBold}>Smart notifications</Text>{' '}
            systems can help you
          </Text>
          <View style={styles.notificationDescriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>Flexible energy</Text>
              <Text style={styles.textBoxDescription}>
                Get reminders for your habits when you have the most energy
              </Text>
            </View>
            <Switch value={true} onValueChange={() => {}} disabled={false} />
          </View>
          <View style={styles.notificationDescriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>Flexible energy</Text>
              <Text style={styles.textBoxDescription}>
                Get reminders for your habits when you have the most energy
              </Text>
            </View>
            <Switch value={true} onValueChange={() => {}} disabled={false} />
          </View>
          <View style={styles.notificationDescriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>Flexible energy</Text>
              <Text style={styles.textBoxDescription}>
                Get reminders for your habits when you have the most energy
              </Text>
            </View>
            <Switch value={true} onValueChange={() => {}} disabled={false} />
          </View>
          <View style={styles.spacer} />
        </View>
        <View style={styles.buttonContainer}>
          <Button label="Continue" onPress={() => {}} type="primary" />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  notificationIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 22,
    borderColor: 'rgba(42, 52, 71, 0.23)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 23,
    alignSelf: 'center',
  },
  title: {
    fontFamily: fontWeights.regular,
    fontSize: 26,
    color: colors.text,
    marginBottom: 65,
  },
  titleBold: {
    fontFamily: fontWeights.bold,
  },
  notificationDescriptionContainer: {
    marginBottom: 10,
    ...colors.dropShadow,
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    width: '100%',
  },
  textBox: {
    gap: 10,
    flex: 1,
  },
  textBoxTitle: {
    fontFamily: fontWeights.semibold,
    fontSize: 14,
    color: colors.text,
  },
  textBoxDescription: {
    fontSize: 11,
    fontFamily: fontWeights.regular,
    color: colors.text,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    height: 54,
  },
});

export default Notifications;
