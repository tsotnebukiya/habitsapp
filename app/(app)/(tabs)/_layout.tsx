import Colors from '@/lib/constants/Colors';
import { fontWeights } from '@/lib/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

function TabBarIcon(props: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <Ionicons
      size={24}
      style={[
        styles.tabBarIcon,
        props.focused ? styles.tabBarLabelFocused : styles.tabBarLabelUnfocused,
      ]}
      {...props}
    />
  );
}

function TabBarLabel(props: { children: React.ReactNode; focused: boolean }) {
  return (
    <Text
      style={[
        styles.tabBarLabel,
        props.focused ? styles.tabBarLabelFocused : styles.tabBarLabelUnfocused,
      ]}
    >
      {props.children}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarItemStyle: {
              marginLeft: 20,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="home" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>Home</TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            headerShown: false,
            tabBarItemStyle: {
              marginRight: 40,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="stats-chart" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>Stats</TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Badges',
            headerShown: false,
            tabBarItemStyle: {
              marginLeft: 40,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="medal" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>Badges</TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarItemStyle: {
              marginRight: 20,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="settings" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>Settings</TabBarLabel>
            ),
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-habit')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 87,
    paddingTop: 0,
    margin: 0,
    borderTopWidth: 0,
  },
  tabBarIcon: {
    marginBottom: -3,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  tabBarLabelFocused: {
    color: Colors.primary,
    fontFamily: fontWeights.bold,
  },
  tabBarLabelUnfocused: {
    color: Colors.tabBarGrey,
    fontFamily: fontWeights.semibold,
  },
  addButton: {
    position: 'absolute',
    bottom: 45,
    zIndex: 1,
    left: '50%',
    transform: [{ translateX: -27.5 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
