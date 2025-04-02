// app/onboarding/OnboardingNotifications.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

import { useUserProfileStore } from '../../interfaces/user_profile';
import { registerForPushNotificationsAsync, savePushToken } from '../../utils/NotificationsSetup';
import { onboardingGradient } from './newOnboardingStyles';
import Colors from '../../constants/Colors';
import { OnboardingProgressBar } from '../../components/onboarding/OnboardingProgressBar';
import { ONBOARDING_STEPS } from './OnboardingSteps';

function OnboardingNotifications() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { profile } = useUserProfileStore();
    
    const currentIndex = ONBOARDING_STEPS.indexOf('/onboarding/OnboardingNotifications');

    const nextStep = () => {
        const nextStepIndex = currentIndex + 1;
        if (nextStepIndex < ONBOARDING_STEPS.length) {
            router.push(ONBOARDING_STEPS[nextStepIndex]);
        } else {
            router.replace('/(tabs)');
        }
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const token = await registerForPushNotificationsAsync();
            
            if (token && profile?.id) {
                await savePushToken(profile.id, token);
                Toast.show({
                    type: 'success',
                    text1: 'Notifications enabled successfully!',
                });
            }
            
            nextStep(); // Changed from router.replace('/(tabs)')
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to enable notifications',
                text2: 'Please try again or skip for now.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        nextStep(); // Changed from router.replace('/(tabs)')
    };

    return (
        <LinearGradient colors={onboardingGradient} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.progressBarContainer}>
                    <OnboardingProgressBar
                        step={currentIndex + 1}
                        steps={ONBOARDING_STEPS.length}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <FontAwesome6
                            name="bell"
                            size={60}
                            color={Colors.shared.primary[500]}
                        />
                    </View>

                    <Text style={styles.title}>Enable Notifications</Text>
                    <Text style={styles.subtitle}>
                        Get timely reminders and updates to stay on track with your goals
                    </Text>

                    <View style={styles.featureList}>
                        <FeatureItem
                            icon="clock"
                            text="Daily reminders to help you stay consistent"
                        />
                        <FeatureItem
                            icon="trophy"
                            text="Celebrate your achievements and milestones"
                        />
                        <FeatureItem
                            icon="star"
                            text="Important updates and personalized insights"
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.enableButton]}
                        onPress={handleEnableNotifications}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Enabling...' : 'Enable Notifications'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.skipButton]}
                        onPress={handleSkip}
                        disabled={isLoading}
                    >
                        <Text style={styles.skipButtonText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.featureItem}>
        <FontAwesome6
            name={icon as any}
            size={20}
            color={Colors.shared.primary[500]}
            style={styles.featureIcon}
        />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    progressBarContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.shared.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text.primary,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    featureList: {
        width: '100%',
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIcon: {
        backgroundColor: Colors.shared.primary[50],
        padding: 12,
        borderRadius: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 16,
        color: Colors.light.text.primary,
        lineHeight: 22,
    },
    buttonContainer: {
        padding: 24,
        gap: 12,
    },
    button: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enableButton: {
        backgroundColor: Colors.shared.primary[500],
    },
    skipButton: {
        backgroundColor: Colors.light.background.default,
        borderWidth: 1,
        borderColor: Colors.light.border.default,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.background.default,
    },
    skipButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text.primary,
    },
});

export default OnboardingNotifications;