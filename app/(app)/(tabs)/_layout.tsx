// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Colors from '../../../lib/constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return <Ionicons size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: Colors.palette.primary[500],
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="bar-chart" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="journal" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="settings" color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
