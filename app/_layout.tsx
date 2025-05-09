// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Slot,
  SplashScreen,
  Stack,
  useNavigationContainerRef,
} from 'expo-router';
import React from 'react';
import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { POSTHOG_API_KEY, SENTRY_DSN } from '../safe_constants';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ModalContainer from '@/components/modals/ModalContainer';
import { isRunningInExpoGo } from 'expo';

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
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const ref = useNavigationContainerRef();
  React.useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
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
