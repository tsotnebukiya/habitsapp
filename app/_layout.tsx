// app/_layout.tsx

// Declare appStartTime on globalThis for wider compatibility
declare global {
  var appStartTime: number | undefined;
}

globalThis.appStartTime = performance.now();
import ModalContainer from '@/components/modals/ModalContainer';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { POSTHOG_API_KEY, SENTRY_DSN } from '../safe_constants';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(app)',
};

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loadedPoppins, errorPoppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [loadedInter, errorInter] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const ref = useNavigationContainerRef();
  React.useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    if (errorPoppins) throw errorPoppins;
    if (errorInter) throw errorInter;
  }, [errorPoppins, errorInter]);

  useEffect(() => {
    if (loadedPoppins && loadedInter) {
      SplashScreen.hideAsync();
      if (globalThis.appStartTime) {
        const appLoadTime = performance.now() - globalThis.appStartTime;
        console.log(`App loaded in: ${appLoadTime.toFixed(2)} ms`);
      } else {
        console.log('App loaded (start time not recorded).');
      }
    }
  }, [loadedPoppins, loadedInter]);

  if (!loadedPoppins || !loadedInter) {
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
        {/* <RevenueCatProvider> */}
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
                  options={{ headerShown: false }}
                />
              </Stack>
              <ModalContainer />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
          <Toast />
        </KeyboardProvider>
      </PostHogProvider>
    </>
  );
}

export default Sentry.wrap(RootLayout);
// export default RootLayout; // Temporarily export RootLayout directly
