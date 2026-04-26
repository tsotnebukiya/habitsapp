import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { usePostHog } from 'posthog-react-native';

export function useTrackedScreen(
  screenName: string,
  properties?: Record<string, any>,
  deps: ReadonlyArray<unknown> = []
) {
  const posthog = usePostHog();

  useFocusEffect(
    useCallback(() => {
      posthog.screen(screenName, properties);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posthog, screenName, ...deps])
  );
}
