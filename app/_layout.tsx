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
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { POSTHOG_API_KEY, SENTRY_DSN } from '../safe_constants';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
// import { RevenueCatProvider } from '../contexts/RevenueCatContext';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay:
    Constants?.executionEnvironment === ExecutionEnvironment?.StoreClient, // Only in native builds, not in Expo Go.
});
Sentry.init({
  // Only enable in production.
  dsn:
    (process?.env?.['NODE_ENV'] ?? 'non-development') === 'development'
      ? undefined
      : SENTRY_DSN,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
  enableNativeFramesTracking:
    Constants?.executionEnvironment === ExecutionEnvironment?.StoreClient, // Only in native builds, not in Expo Go.
});

export const fullWidth = Dimensions.get('screen').width;
export const marginSpacing = fullWidth * 0.05;
export const screen90 = fullWidth * 0.9;

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(app)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const ref = useNavigationContainerRef();
  React.useEffect(() => {
    if (ref) {
      navigationIntegration?.registerNavigationContainer(ref);
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
    return <Slot />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <PostHogProvider
        apiKey={POSTHOG_API_KEY}
        options={{
          disabled:
            (process?.env?.['NODE_ENV'] ?? 'non-development') === 'development',
          host: 'https://us.i.posthog.com',
        }}
      >
        {/* <RevenueCatProvider> */}
        <KeyboardProvider>
          <GestureHandlerRootView
            style={{
              flex: 1,
              // backgroundColor: theme.background.default
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
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
          <Toast />
        </KeyboardProvider>
        {/* </RevenueCatProvider> */}
      </PostHogProvider>
    </>
  );
}

export default Sentry.wrap(RootLayout);
