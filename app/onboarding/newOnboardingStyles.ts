// app/onboarding/newOnboardingStyles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export const onboardingGradient = [
    Colors.shared.primary[50],
    Colors.shared.secondary[50],
    Colors.shared.primary[50],
    Colors.shared.neutral[50]
];

export const newOnboardingStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    progressBarContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 40,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: Colors.light.text.primary,
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.light.text.secondary,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.shared.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.shared.primary[200],
    },
    continueButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.shared.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        shadowColor: Colors.shared.neutral[900],
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    continueButtonText: {
        color: Colors.light.background.default,
        fontSize: 18,
        fontWeight: '600',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background.default,
        borderRadius: 25,
        padding: 15,
        marginBottom: 15,
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.shared.primary[400],
        shadowColor: Colors.shared.neutral[900],
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonIcon: {
        marginRight: 6,
        tintColor: Colors.shared.primary[500],
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 14,
        color: Colors.light.text.primary,
        textAlign: 'center',
        marginTop: 20,
    },
    termsLink: {
        color: Colors.shared.primary[500],
        fontWeight: '600',
    },
});