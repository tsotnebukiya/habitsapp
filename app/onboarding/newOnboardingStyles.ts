// app/onboarding/newOnboardingStyles.ts
import { StyleSheet } from 'react-native';
import Colors from '@/lib/constants/Colors';

export const onboardingGradient = [
  Colors.bgDark,
  Colors.bgDark,
  Colors.bgDark,
  Colors.bgDark,
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
    color: Colors.bgDark,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.bgDark,
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
    backgroundColor: Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgDark,
  },
  continueButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: Colors.bgDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    color: Colors.bgDark,
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.bgDark,
    shadowColor: Colors.bgDark,
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
    tintColor: Colors.bgDark,
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: Colors.bgDark,
    textAlign: 'center',
    marginTop: 20,
  },
  termsLink: {
    color: Colors.bgDark,
    fontWeight: '600',
  },
});
