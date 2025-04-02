// app/onboarding/OnboardingEmailSignupModal.tsx
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    KeyboardAvoidingView, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

import { supabase } from '../supabase';
import { useUserProfileStore } from '../../interfaces/user_profile';
import { useAppStateStore } from '../../interfaces/app_state';
import Colors from '../../constants/Colors';
import { newOnboardingStyles, onboardingGradient } from './newOnboardingStyles';

function SignupPage() {
    const router = useRouter();
    const { profile, setProfile, updateProfile } = useUserProfileStore();
    const { setMetadata } = useAppStateStore();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Please fill in all fields',
            });
            return;
        }

        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const userData = {
                    id: data.user.id,
                    email: email,
                    displayName: email.split('@')[0],
                    dateOfBirth: profile?.dateOfBirth,
                    createdAt: dayjs().toISOString(),
                    updatedAt: dayjs().toISOString(),
                    onboardingComplete: false
                };

                const { error: insertError } = await supabase
                    .from('users')
                    .upsert(userData);

                if (insertError) throw insertError;

                setProfile(userData);
                setMetadata('signupCompleted', true);
                
                Toast.show({
                    type: 'success',
                    text1: 'Sign up successful!',
                });

                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error signing up',
                text2: error.message || 'Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={onboardingGradient} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView 
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerContainer}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <FontAwesome6 
                                    name="chevron-left" 
                                    size={20} 
                                    color={Colors.shared.primary[500]} 
                                />
                            </TouchableOpacity>

                            <View style={styles.contentContainer}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>
                                    Enter your email and create a password
                                </Text>

                                <TextInput
                                    editable={!isLoading}
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor={Colors.light.text.hint}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                                <TextInput
                                    editable={!isLoading}
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.light.text.hint}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoComplete="new-password"
                                />
                            </View>
                            
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, isLoading && styles.buttonDisabled]}
                                    onPress={handleSignup}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={Colors.light.background.default} />
                                    ) : (
                                        <Text style={styles.buttonText}>Create Account</Text>
                                    )}
                                </TouchableOpacity>

                                <Text style={styles.termsText}>
                                    By creating an account, you agree to our{' '}
                                    <Text style={styles.termsLink}>Terms of Service</Text>
                                    {' '}and{' '}
                                    <Text style={styles.termsLink}>Privacy Policy</Text>
                                </Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 20,
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
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.text.secondary,
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: Colors.light.border.default,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: Colors.light.background.default,
        color: Colors.light.text.primary,
    },
    buttonContainer: {
        padding: 20,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.shared.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: Colors.shared.neutral[400],
    },
    buttonText: {
        color: Colors.light.background.default,
        fontSize: 18,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 14,
        color: Colors.light.text.secondary,
        textAlign: 'center',
    },
    termsLink: {
        color: Colors.shared.primary[500],
        fontWeight: '600',
    },
});

export default SignupPage;