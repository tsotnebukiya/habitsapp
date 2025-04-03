import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { ErrorBoundary } from '@sentry/react-native';
import { useHabitsStore } from '@/lib/interfaces/habits';
import useUserProfileStore from '@/lib/interfaces/user_profile';

export default function Home() {
  const { profile } = useUserProfileStore();
  const syncWithServer = useHabitsStore((state) => state.syncWithServer);

  useEffect(() => {
    if (profile?.id) {
      // Initial sync
      syncWithServer();

      // Setup periodic sync every hour
      const syncInterval = setInterval(() => {
        syncWithServer();
      }, 1000 * 60 * 60); // 1 hour

      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [profile?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBoundary>
        <View style={styles.content}></View>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
