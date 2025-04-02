// app/onboarding/OnboardingTrialTimeline.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { newOnboardingStyles, onboardingGradient } from "./newOnboardingStyles";
import PaymentPlansModal from "./PaymentPlansModal";
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';
import { useAppStateStore } from '../../interfaces/app_state';
import { ONBOARDING_STEPS } from "./OnboardingSteps";

interface TimelineStep {
    day: number;
    label: string;
    complete?: boolean;
    isReminder?: boolean;
    isEnd?: boolean;
}

function OnboardingTrialTimeline() {
    const router = useRouter();
    const [showPlansModal, setShowPlansModal] = useState(false);
    const { metadata, setMetadata } = useAppStateStore();
    const selectedPlan = metadata.selectedPlan || 'yearly';

    const currentIndex = ONBOARDING_STEPS.indexOf('/onboarding/OnboardingTrialTimeline');

    const timelineSteps: TimelineStep[] = [
        { day: 1, label: "Take initiative to make your life better.", complete: true },
        { day: 7, label: "Your first week of consistency - keep it up!" },
        { day: 10, label: "10 days of consistency - keep it up!", isReminder: true },
        { day: 14, label: "Your Pro yearly plan starts.", isEnd: true }
    ];

    const handleStartTrial = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setMetadata('trialStarted', true);
        const nextStepIndex = currentIndex + 1;
        if (nextStepIndex < ONBOARDING_STEPS.length) {
            router.replace(ONBOARDING_STEPS[nextStepIndex]);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            router.push(ONBOARDING_STEPS[currentIndex - 1]);
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    const handlePurchaseSuccess = () => {
        setMetadata('subscription', 'active');
        router.replace('/(tabs)');
    };

    return (
        <LinearGradient colors={onboardingGradient} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>What Pro Looks Like</Text>
                        <Text style={styles.subtitle}>
                            Premium features for a premium experience.
                        </Text>
                    </View>

                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLine} />
                        {timelineSteps.map((step, index) => (
                            <View key={index} style={styles.timelineStep}>
                                <View style={[
                                    styles.timelineDot,
                                    step.complete ? styles.completeDot :
                                        step.isEnd ? styles.endDot :
                                            styles.futureDot
                                ]}>
                                    {step.complete ? (
                                        <FontAwesome6 name="check" size={12} color={Colors.light.background.default} />
                                    ) : (
                                        <Text style={styles.dotText}>{step.day}</Text>
                                    )}
                                </View>

                                <View style={styles.stepContent}>
                                    <Text style={styles.dayText}>Day {step.day}</Text>
                                    <Text style={styles.stepLabel}>{step.label}</Text>

                                    {step.isReminder && (
                                        <View style={styles.reminderCard}>
                                            <Text style={styles.reminderTitle}>Trial Reminder</Text>
                                            <Text style={styles.reminderText}>
                                                We'll remind you before your trial ends so you can decide if you'd like to continue.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.fixedFooter}>
                    <TouchableOpacity
                        style={[newOnboardingStyles.continueButton, styles.trialButton]}
                        onPress={handleStartTrial}
                    >
                        <Text style={newOnboardingStyles.continueButtonText}>
                            Start 14-Day Free Trial
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.pricingContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.pricingLabel}>Then </Text>
                            <Text style={styles.price}>{selectedPlan === 'yearly' ? '$49.99' : '$5'}</Text>
                            <Text style={styles.period}>/{selectedPlan === 'yearly' ? 'year' : 'month'}</Text>
                        </View>
                        <TouchableOpacity hitSlop={50} onPress={() => setShowPlansModal(true)}>
                            <Text style={styles.viewPlansText}>View all plans</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <PaymentPlansModal
                    visible={showPlansModal}
                    onClose={() => setShowPlansModal(false)}
                    onSuccess={handlePurchaseSuccess}
                />
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.shared.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.shared.primary[200],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    spacer: {
        height: 120,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.text.secondary,
        textAlign: 'center',
    },
    timelineContainer: {
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 23,
        top: 20,
        bottom: 20,
        width: 2,
        backgroundColor: Colors.shared.primary[200],
    },
    timelineStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingLeft: 8,
    },
    timelineDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    completeDot: {
        backgroundColor: Colors.shared.success.main,
    },
    endDot: {
        backgroundColor: Colors.shared.primary[500],
    },
    futureDot: {
        backgroundColor: Colors.shared.primary[500],
    },
    dotText: {
        color: Colors.light.background.default,
        fontSize: 12,
        fontWeight: '600',
    },
    stepContent: {
        flex: 1,
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text.primary,
        marginBottom: 4,
    },
    stepLabel: {
        fontSize: 14,
        color: Colors.light.text.secondary,
    },
    reminderCard: {
        backgroundColor: Colors.shared.neutral[100],
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    reminderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.shared.warning.dark,
        marginBottom: 4,
    },
    reminderText: {
        fontSize: 12,
        color: Colors.shared.warning.main,
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.light.background.default,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border.default,
    },
    trialButton: {
        marginBottom: 12,
    },
    pricingContainer: {
        alignItems: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    pricingLabel: {
        fontSize: 14,
        color: Colors.light.text.secondary,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text.primary,
    },
    period: {
        fontSize: 14,
        color: Colors.light.text.secondary,
        marginLeft: 2,
    },
    monthly: {
        fontSize: 12,
        color: Colors.light.text.hint,
        marginTop: 4,
    },
    viewPlansText: {
        fontSize: 12,
        color: Colors.shared.primary[600],
        marginTop: 4,
    },
});

export default OnboardingTrialTimeline;