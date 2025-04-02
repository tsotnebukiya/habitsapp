// app/(app)/(tabs)/settings.tsx
import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, Text, TouchableOpacity, Switch, Linking, Alert } from 'react-native';
import useUserProfileStore from '../../../interfaces/user_profile';
import Colors from '../../../constants/Colors';
import { useRouter } from 'expo-router';
import { useAppStateStore } from '../../../interfaces/app_state';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';

const SettingsScreen = () => {
  const router = useRouter();
  const { restorePurchases } = useRevenueCat();
  const [language, setLanguage] = useState('English');
  const { profile } = useUserProfileStore();
  const { preferences, setNotificationPreferences } = useAppStateStore();

  const { emailNotifications, pushNotifications } = preferences;

  const handleLogout = () => {
    // Implement logout logic
  };

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
      // Show success message
      Alert.alert('Success', 'Your purchases have been restored successfully.');
    } catch (error) {
      // Show error message
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionBody}>

            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push('/notifications')}
              >
                <View>
                  <Text style={styles.rowLabel}>Notifications</Text>
                  <Text style={styles.rowDescription}>
                    {pushNotifications && emailNotifications
                      ? 'Push and Email'
                      : pushNotifications
                        ? 'Push only'
                        : emailNotifications
                          ? 'Email only'
                          : 'Disabled'}
                  </Text>
                </View>
                <View style={styles.notificationSwitches}>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Push</Text>
                    <Switch
                      value={pushNotifications}
                      onValueChange={(value) =>
                        setNotificationPreferences(emailNotifications, value)
                      }
                      trackColor={{
                        false: Colors.shared.neutral[300],
                        true: Colors.shared.success.main
                      }}
                    />
                  </View>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Email</Text>
                    <Switch
                      value={emailNotifications}
                      onValueChange={(value) =>
                        setNotificationPreferences(value, pushNotifications)
                      }
                      trackColor={{
                        false: Colors.shared.neutral[300],
                        true: Colors.shared.success.main
                      }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Language</Text>
                <Text style={styles.rowValue}>{language}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Email</Text>
                <Text style={styles.rowValue}>{profile?.email ?? "No email"}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity style={styles.row} onPress={handleRestorePurchases}>
                <Text style={styles.rowLabel}>Restore Purchases</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://devstarterpacks.com/')}>
                <Text style={styles.rowLabel}>FAQ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://devstarterpacks.com/')}>
                <Text style={styles.rowLabel}>Contact Support</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity style={styles.row} >
                <Text style={styles.rowLabel}>About</Text>
                <Text style={styles.rowValue}>v1.0.0</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 16,
  },
  sectionBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rowWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  rowLabel: {
    fontSize: 16,
    color: '#000',
  },
  rowValue: {
    fontSize: 16,
    color: '#666',
  },
  logoutSection: {
    marginTop: 24,
    marginBottom: 48,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  rowDescription: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginTop: 2,
  },
  notificationSwitches: {
    flexDirection: 'row',
    gap: 16,
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: Colors.light.text.secondary,
    marginBottom: 4,
  },
});

export default SettingsScreen;