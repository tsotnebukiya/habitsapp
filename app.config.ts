import { ExpoConfig, ConfigContext } from 'expo/config';

const DEV_MODE = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: DEV_MODE ? 'app-dev' : 'app',
  slug: 'app-name',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/AppIcons/appstore.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  owner: 'devstarterpacks',
  splash: {
    image: './assets/react-native-splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: DEV_MODE
      ? 'com.devstarterpacks.appdev'
      : 'com.devstarterpacks.app',
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['com.googleusercontent.apps.XXXXX'],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/AppIcons/playstore.png',
      backgroundColor: '#000',
    },
    package: DEV_MODE
      ? 'com.devstarterpacks.appdev'
      : 'com.devstarterpacks.app',
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
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
        iosUrlScheme: 'com.googleusercontent.apps.XXXXX',
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'react-native',
        organization: '<YOUR_ORGANIZATION_NAME>',
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
      projectId: '<YOUR_PROJECT_ID>',
    },
  },
});
