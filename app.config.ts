import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({
  config,
}: ConfigContext): ExpoConfig & { ios: { appleTeamId: string } } => ({
  name: 'HabitsApp',
  slug: 'HabitsApp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'habitsapp',
  userInterfaceStyle: 'automatic',
  owner: 'tsotnebukiya',
  assetBundlePatterns: ['**/*'],
  ios: {
    appleTeamId: '43SWDCX5G6',
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: 'com.vdl.habitapp',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            'com.googleusercontent.apps.837545270747-ceogif38qd67fhua53ttp5g0hq45vg8i',
          ],
        },
        {
          CFBundleURLSchemes: ['fb1938696366898999'],
        },
      ],
    },
    entitlements: {
      'com.apple.security.application-groups': [
        'group.com.vdl.habitapp.widget',
      ],
    },
  },
  android: {
    package: 'com.vdl.habitapp',
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-localization',
    'expo-apple-authentication',
    '@bacons/apple-targets',
    [
      'react-native-fbsdk-next',
      {
        appID: '1938696366898999',
        clientToken: '870e81c61564d34b9b71b13155b56e93',
        displayName: 'HabitsLab',
        scheme: 'fb1938696366898999',
        advertiserIDCollectionEnabled: false,
        autoLogAppEventsEnabled: false,
        isAutoInitEnabled: true,
      },
    ],
    [
      'expo-splash-screen',
      {
        android: {
          image: './assets/splash-icon.png',
          backgroundColor: '#DCEEFF',
          imageWidth: 300,
        },
        ios: {
          image: './assets/splash.png',
          enableFullScreenImage_legacy: true,
          backgroundColor: 'black',
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
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
          deploymentTarget: '15.1',
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
        project: 'habitsapp',
        organization: 'viral-development-llc',
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
