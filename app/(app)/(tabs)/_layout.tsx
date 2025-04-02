// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Colors from '../../../constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
    name: string;
    color: string;
}) {
    return <FontAwesome6 size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Tabs
                initialRouteName='index'
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
                        tabBarIcon: ({ color }) => <TabBarIcon name="house" color={color} />,
                    }}

                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        headerShown: false,
                        tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
                    }}
                />
            </Tabs>
        </GestureHandlerRootView>
    );
}
