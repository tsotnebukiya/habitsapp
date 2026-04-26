import { ConfigContext, ExpoConfig } from 'expo/config';

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getAppVariant() {
  if (process.env.APP_VARIANT) {
    return process.env.APP_VARIANT;
  }

  if (process.env.EAS_BUILD_PROFILE) {
    return process.env.EAS_BUILD_PROFILE;
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

const sentryOrg = getOptionalEnv('SENTRY_ORG') ?? 'viral-development-llc';
const sentryProject = getOptionalEnv('SENTRY_PROJECT') ?? 'habitsapp';
const sentryUrl = getOptionalEnv('SENTRY_URL') ?? 'https://sentry.io/';
const sentryDsn = getOptionalEnv('EXPO_PUBLIC_SENTRY_DSN') ?? null;

export default ({
  config,
}: ConfigContext): ExpoConfig & { ios: { appleTeamId: string } } => ({
  name: 'HabitsLab',
  slug: 'HabitsApp',
  version: '1.0.2',
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
        url: sentryUrl,
        project: sentryProject,
        organization: sentryOrg,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    appVariant: getAppVariant(),
    sentryDsn,
    sentryOrg,
    sentryProject,
    sentryUrl,
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
