import ModalContainer from '@/components/modals/ModalContainer';
import toastConfig from '@/components/shared/toastConfig';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import Superwall, { SuperwallOptions } from '@superwall/react-native-superwall';
import { isRunningInExpoGo } from 'expo';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import {
  POSTHOG_API_KEY,
  SENTRY_DSN,
  SUPERWALL_ANDROID_KEY,
  SUPERWALL_IOS_KEY,
} from '../safe_constants';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

const apiKey =
  Platform.OS === 'ios' ? SUPERWALL_IOS_KEY : SUPERWALL_ANDROID_KEY;

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loadedPoppins, errorPoppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const ref = useNavigationContainerRef();

  React.useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    if (errorPoppins) throw errorPoppins;
  }, [errorPoppins]);

  useEffect(() => {
    if (loadedPoppins) {
      SplashScreen.hideAsync();
      const options = new SuperwallOptions();
      options.paywalls.shouldPreload = true;
      Superwall.configure({
        apiKey: apiKey,
        options: options,
      });
    }
  }, [loadedPoppins]);

  if (!loadedPoppins) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <PostHogProvider
        apiKey={POSTHOG_API_KEY}
        options={{
          host: 'https://us.i.posthog.com',
        }}
      >
        <KeyboardProvider>
          <GestureHandlerRootView
            style={{
              flex: 1,
            }}
          >
            <BottomSheetModalProvider>
              <Stack initialRouteName="(app)">
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding"
                  options={{
                    headerShown: false,
                    animation: 'none',
                  }}
                />
                <Stack.Screen
                  name="language"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                    animation: 'slide_from_bottom',
                  }}
                />
              </Stack>
              <ModalContainer />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </PostHogProvider>
      <Toast config={toastConfig} />
    </>
  );
}

export default Sentry.wrap(RootLayout);
