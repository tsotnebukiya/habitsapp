// app/(app)/notifications.tsx
import React, { useEffect } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Switch,
    ScrollView,
} from 'react-native';
import { useNavigation } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../../components/notifications/NotificationManager';
import { commonStyles } from '../../components/common/commonStyles';
import { marginSpacing } from '../_layout';
import Colors from '../../constants/Colors';
import { useAppStateStore } from '../../interfaces/app_state';

function NotificationsScreen() {
    const navigation = useNavigation();
    const { scheduleGoalReminder, scheduleWeightCheckInReminder } = useNotifications();
    
    const { 
        preferences,
        setNotificationPreferences,
        updatePreferences
    } = useAppStateStore();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        Notifications.getPermissionsAsync().then(({ status }) => {
            updatePreferences({
                pushNotifications: status === 'granted'
            });
        });
    }, []);

    const handlePushToggle = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setNotificationPreferences(preferences.emailNotifications, true);
                await scheduleWeightCheckInReminder();
                await scheduleGoalReminder();
            }
        } else {
            setNotificationPreferences(preferences.emailNotifications, false);
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    const handleEmailToggle = (value: boolean) => {
        setNotificationPreferences(value, preferences.pushNotifications);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background.default }}>
            <Text style={commonStyles.pageTitleText}>Notifications</Text>

            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <View style={styles.sectionBody}>
                        <View style={[styles.row, styles.rowFirst]}>
                            <View style={styles.rowContent}>
                                <Text style={styles.rowLabel}>Push Notifications</Text>
                                <Text style={styles.rowDescription}>Receive reminders and updates</Text>
                            </View>
                            <Switch
                                value={preferences.pushNotifications}
                                onValueChange={handlePushToggle}
                                trackColor={{ 
                                    false: Colors.shared.neutral[300], 
                                    true: Colors.shared.success.main 
                                }}
                            />
                        </View>
                        <View style={[styles.row, styles.rowLast]}>
                            <View style={styles.rowContent}>
                                <Text style={styles.rowLabel}>Email Notifications</Text>
                                <Text style={styles.rowDescription}>Receive updates via email</Text>
                            </View>
                            <Switch
                                value={preferences.emailNotifications}
                                onValueChange={handleEmailToggle}
                                trackColor={{ 
                                    false: Colors.shared.neutral[300], 
                                    true: Colors.shared.success.main 
                                }}
                            />
                        </View>
                    </View>
                </View>

                {preferences.pushNotifications && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Settings</Text>
                        <Text style={styles.sectionDescription}>
                            Configure your notification preferences in your device settings for more options.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: marginSpacing
    },
    section: {
        paddingHorizontal: marginSpacing,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
        color: Colors.light.text.primary,
    },
    sectionDescription: {
        fontSize: 14,
        color: Colors.light.text.secondary,
        marginTop: 4,
    },
    sectionBody: {
        backgroundColor: Colors.light.background.paper,
        borderRadius: 12,
        shadowColor: Colors.shared.neutral[900],
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.light.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border.light,
    },
    rowFirst: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    rowLast: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderBottomWidth: 0,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 16,
        color: Colors.light.text.primary,
        marginBottom: 4,
    },
    rowDescription: {
        fontSize: 14,
        color: Colors.light.text.secondary,
    },
});

export default NotificationsScreen;