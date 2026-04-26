import Constants from 'expo-constants';

type SentryRuntimeConfig = {
  dsn: string | null;
  organization: string | null;
  project: string | null;
  url: string | null;
};

function getExtraString(key: string) {
  const value = Constants.expoConfig?.extra?.[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

export function getSentryRuntimeConfig(): SentryRuntimeConfig {
  return {
    dsn: getExtraString('sentryDsn'),
    organization: getExtraString('sentryOrg'),
    project: getExtraString('sentryProject'),
    url: getExtraString('sentryUrl'),
  };
}
