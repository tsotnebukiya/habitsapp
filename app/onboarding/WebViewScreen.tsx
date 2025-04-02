// app/onboarding/WebViewScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const WebViewScreen = () => {
    const { url, title } = useLocalSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <FontAwesome6 
                        name="chevron-left" 
                        size={18} 
                        color={Colors.light.text.primary} 
                    />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.headerRight} />
            </View>

            {/* WebView */}
            <View style={styles.webViewContainer}>
                <WebView 
                    source={{ uri: url as string }}
                    style={styles.webView}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator 
                                size="large" 
                                color={Colors.shared.primary[500]}
                            />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    )}
                />
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator 
                            size="large" 
                            color={Colors.shared.primary[500]}
                        />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background.default,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border.light,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    backText: {
        marginLeft: 4,
        fontSize: 16,
        color: Colors.light.text.primary,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.light.text.primary,
    },
    headerRight: {
        width: 70, // Balance the header
    },
    webViewContainer: {
        flex: 1,
        backgroundColor: Colors.light.background.default,
    },
    webView: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.light.background.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.light.text.secondary,
        fontWeight: '500',
    },
});

export default WebViewScreen;