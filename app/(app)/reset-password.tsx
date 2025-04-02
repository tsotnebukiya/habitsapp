// app/(app)/reset-password.tsx
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from "react-native";
import Colors from "../../constants/Colors";

const ResetPassword = () => {
    const router = useRouter();
    const [alert, setAlert] = useState(false);

    const sendMail = () => {
        // Implement email sending logic here
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="chevron-left" size={20} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Password</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={styles.content}>
                <Text style={styles.titleText}>
                    Change or Create Password
                </Text>
                <Text style={styles.descriptionText}>
                    To change your existing password or add the ability to sign in with email/password to an existing social sign-in account, press the button below. You will receive an email asking you to create a new password.
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => { setAlert(true); sendMail(); }}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
            </View>
            <Modal
                transparent={true}
                visible={alert}
                onRequestClose={() => setAlert(false)}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Reset Email Sent</Text>
                        <Text style={styles.modalText}>Check your email and follow the instructions to complete the process.</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setAlert(false)}
                        >
                            <Text style={styles.closeButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: 36,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    titleText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
        color: '#333',
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.palette.primary[500],
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: Colors.palette.neutral[900],
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    modalText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
});

export default ResetPassword;