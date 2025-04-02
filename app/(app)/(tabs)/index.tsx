// app/(app)/(tabs)/index.tsx
import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorBoundary } from '@sentry/react-native';
import Colors from '@/constants/Colors';
import FAB from '@/components/FAB/FAB';
import SubButton from '@/components/FAB/SubButton';
import PushupHistory from '@/components/pushups/PushupHistory';
import PushupStats from '@/components/pushups/PushupStats';
import { router } from 'expo-router';
import { usePushupStore } from '@/interfaces/pushup_store';
// import { useUser } from '@/interfaces/user_profile';

export default function Home() {
  const gradientColors = [
    Colors.shared.primary[50],
    Colors.light.background.default,
    Colors.shared.primary[50],
  ];
  // const user = useUser();
  // useEffect(() => {
  //   // Setup real-time sync when user logs in
  //   if (user) {
  //     const cleanup = usePushupStore.getState().setupRealtimeSubscription();

  //     // Optional cleanup
  //     return () => {
  //       cleanup();
  //     };
  //   }
  // }, [user]);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ErrorBoundary>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Colors.shared.primary[50]}
            translucent
          />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pushup Tracker</Text>
          </View>

          <View style={styles.content}>
            <PushupStats />
            <PushupHistory />
          </View>

          <FAB>
            <SubButton
              iconName="dumbbell"
              label="Add Pushups"
              onPress={() => {
                router.push('/add-edit-pushups');
              }}
            />
          </FAB>
        </ErrorBoundary>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  content: {
    flex: 1,
  },
});
