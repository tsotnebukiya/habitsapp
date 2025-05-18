// app/onboarding/newOnboardingStyles.ts
import { colors } from '@/lib/constants/ui';
import { StyleSheet } from 'react-native';

export const onboardingGradient = [
  colors.bgDark,
  colors.bgDark,
  colors.bgDark,
  colors.bgDark,
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
    color: colors.bgDark,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: colors.bgDark,
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
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bgDark,
  },
  continueButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: colors.bgDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    color: colors.bgDark,
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.bgDark,
    shadowColor: colors.bgDark,
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
    tintColor: colors.bgDark,
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: colors.bgDark,
    textAlign: 'center',
    marginTop: 20,
  },
  termsLink: {
    color: colors.bgDark,
    fontWeight: '600',
  },
});
