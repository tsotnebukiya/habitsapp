import Colors from '@/lib/constants/Colors';
import { ACTIVE_OPACITY } from '@/lib/constants/layouts';
import { fontWeights } from '@/lib/constants/Typography';
import { router, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon(props: { source: any; focused: boolean }) {
  return (
    <View>
      <Icon
        size={24}
        source={props.source}
        color={props.focused ? Colors.primary : Colors.tabBarGrey}
      />
    </View>

    // <Ionicons
    //   size={24}
    //   style={[
    //     styles.tabBarIcon,
    //     props.focused ? styles.tabBarLabelFocused : styles.tabBarLabelUnfocused,
    //   ]}
    //   {...props}
    // />
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
  const insets = useSafeAreaInsets();
  console.log(insets.bottom);
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
              <TabBarIcon
                source={require('@/assets/icons/home-smile.png')}
                focused={focused}
              />
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
              <TabBarIcon
                source={require('@/assets/icons/bar-chart-10.png')}
                focused={focused}
              />
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
              <TabBarIcon
                source={require('@/assets/icons/award-05.png')}
                focused={focused}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>Badges</TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarItemStyle: {
              marginRight: 20,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                source={require('@/assets/icons/user-01.png')}
                focused={focused}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>Profile</TabBarLabel>
            ),
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 3 }]}
        onPress={() => router.push('/add-habit')}
        activeOpacity={ACTIVE_OPACITY}
      >
        <Icon size={24} source={require('@/assets/icons/plus.png')} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
  },
  tabBarIcon: {
    // marginTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  tabBarLabelFocused: {
    color: Colors.primary,
    fontFamily: fontWeights.interBold,
  },
  tabBarLabelUnfocused: {
    color: Colors.tabBarGrey,
    fontFamily: fontWeights.interSemiBold,
  },
  addButton: {
    position: 'absolute',
    zIndex: 1,
    left: '50%',
    transform: [{ translateX: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
