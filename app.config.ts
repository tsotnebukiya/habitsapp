import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'HabitsApp',
  slug: 'HabitsApp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/AppIcons/appstore.png',
  scheme: 'habitsapp',
  userInterfaceStyle: 'automatic',
  owner: 'tsotnebukiya',
  splash: {
    image: './assets/react-native-splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: 'com.vdl.habitapp',
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            'com.googleusercontent.apps.837545270747-ceogif38qd67fhua53ttp5g0hq45vg8i',
          ],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/AppIcons/playstore.png',
      backgroundColor: '#000',
    },
    package: 'com.vdl.habitapp',
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-localization',
    'expo-apple-authentication',
    [
      'expo-notifications',
      {
        icon: './assets/AppIcons/appstore.png',
        color: '#ffffff',
        defaultChannel: 'default',
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          minSdkVersion: 26,
        },
        ios: {
          deploymentTarget: '13.4',
        },
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.837545270747-ceogif38qd67fhua53ttp5g0hq45vg8i',
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'react-native',
        organization: 'Viral Development LLC',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '86db4c6b-889c-4d36-80d6-186e18cb031b',
    },
  },
  updates: {
    url: 'https://u.expo.dev/86db4c6b-889c-4d36-80d6-186e18cb031b',
  },
});
