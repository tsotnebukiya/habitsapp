import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import Button from '@/components/shared/Button';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useOnboardingAnalytics } from '@/lib/hooks/useOnboardingAnalytics';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

const FINGERPRINT_SIZE = 236;
const INNER_FINGERPRINT_SIZE = 188;
const STROKE_WIDTH = 8;
const SEAL_DURATION_MS = 1000;
const LONG_PRESS_DELAY_MS = 500;
const AUTO_CONTINUE_DELAY_MS = 2000;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CommitmentPhase = 'idle' | 'sealing' | 'committed';

function Commitment() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { capture, screen } = useOnboardingAnalytics();
  const setResumeRoute = useOnboardingStore((state) => state.setResumeRoute);
  const [phase, setPhase] = useState<CommitmentPhase>('idle');
  const sealProgress = useRef(new Animated.Value(0)).current;
  const committedTextScale = useRef(new Animated.Value(0.92)).current;
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hapticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoContinueTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const radius = useMemo(
    () => (FINGERPRINT_SIZE - STROKE_WIDTH) / 2,
    []
  );
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = useMemo(
    () =>
      Animated.multiply(
        Animated.subtract(1, sealProgress),
        circumference
      ),
    [circumference, sealProgress]
  );

  useEffect(() => {
    setResumeRoute('/onboarding/commitment');
    screen('onboarding_commitment');
    capture('commitment_screen_viewed');
  }, [capture, screen, setResumeRoute]);

  useEffect(() => {
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
      }
      if (hapticTimeoutRef.current) {
        clearTimeout(hapticTimeoutRef.current);
      }
      if (autoContinueTimeoutRef.current) {
        clearTimeout(autoContinueTimeoutRef.current);
      }
      sealProgress.stopAnimation();
      committedTextScale.stopAnimation();
    };
  }, [committedTextScale, sealProgress]);

  const clearPendingTimers = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    if (hapticTimeoutRef.current) {
      clearTimeout(hapticTimeoutRef.current);
      hapticTimeoutRef.current = null;
    }
    if (autoContinueTimeoutRef.current) {
      clearTimeout(autoContinueTimeoutRef.current);
      autoContinueTimeoutRef.current = null;
    }
  };

  const handleCommitted = () => {
    clearPendingTimers();
    setPhase('committed');
    capture('commitment_completed', {
      commitment_method: 'long_press',
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    committedTextScale.setValue(0.92);
    Animated.spring(committedTextScale, {
      toValue: 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();

    autoContinueTimeoutRef.current = setTimeout(() => {
      setResumeRoute('/onboarding/login');
      router.replace('/onboarding/login');
    }, AUTO_CONTINUE_DELAY_MS);
  };

  const handleFingerprintPress = () => {
    if (phase !== 'idle') {
      return;
    }

    clearPendingTimers();
    setPhase('sealing');
    capture('commitment_fingerprint_pressed', {
      commitment_method: 'long_press',
    });

    const hapticPhases = [
      Haptics.ImpactFeedbackStyle.Light,
      Haptics.ImpactFeedbackStyle.Medium,
      Haptics.ImpactFeedbackStyle.Heavy,
      Haptics.ImpactFeedbackStyle.Heavy,
    ] as const;

    let currentPhase = 0;
    void Haptics.impactAsync(hapticPhases[currentPhase]);

    hapticIntervalRef.current = setInterval(() => {
      currentPhase += 1;
      if (currentPhase >= hapticPhases.length) {
        if (hapticIntervalRef.current) {
          clearInterval(hapticIntervalRef.current);
          hapticIntervalRef.current = null;
        }
        return;
      }

      void Haptics.impactAsync(hapticPhases[currentPhase]);
    }, SEAL_DURATION_MS / hapticPhases.length);

    hapticTimeoutRef.current = setTimeout(() => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
    }, SEAL_DURATION_MS);

    sealProgress.setValue(0);
    Animated.timing(sealProgress, {
      toValue: 1,
      duration: SEAL_DURATION_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        handleCommitted();
      }
    });
  };

  const handleConfirm = () => {
    if (phase !== 'committed') {
      return;
    }

    clearPendingTimers();
    setResumeRoute('/onboarding/login');
    router.push('/onboarding/login');
  };

  const isCommitted = phase === 'committed';
  const isSealing = phase === 'sealing';

  const handleBack = () => {
    capture('commitment_back_button_pressed');
    clearPendingTimers();
    sealProgress.stopAnimation();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/onboarding/intro');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/onboarding/gradient.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Icon
              source={require('@/assets/icons/chevron-left.png')}
              size={18}
              color="black"
            />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.commitment.title')}</Text>

          <Text style={styles.description}>
            {t('onboarding.commitment.description.part1')}
            <Text style={styles.descriptionBold}>
              {t('onboarding.commitment.description.bold1')}
            </Text>
            {t('onboarding.commitment.description.part2')}
            <Text style={styles.descriptionBold}>
              {t('onboarding.commitment.description.bold2')}
            </Text>
            {t('onboarding.commitment.description.part3')}
          </Text>

          <Text style={styles.promiseText}>
            {t('onboarding.commitment.commit')}
          </Text>

          <View style={styles.trustContainer}>
            <Icon source="handshake" size={18} color={colors.primary} />
            <Text style={styles.trustText}>{t('onboarding.commitment.trust')}</Text>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.tapToCommit}>
              <Text style={styles.tapBold}>
                {t('onboarding.commitment.tapBold')}
              </Text>{' '}
              <Text style={styles.tapSub}>{t('onboarding.commitment.tapSub')}</Text>
            </Text>

            <View style={styles.fingerprintSection}>
              {(isSealing || isCommitted) && (
                <Svg
                  width={FINGERPRINT_SIZE}
                  height={FINGERPRINT_SIZE}
                  style={styles.progressSvg}
                >
                  <AnimatedCircle
                    cx={FINGERPRINT_SIZE / 2}
                    cy={FINGERPRINT_SIZE / 2}
                    r={radius}
                    strokeWidth={STROKE_WIDTH}
                    stroke={colors.primary}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90, ${FINGERPRINT_SIZE / 2}, ${FINGERPRINT_SIZE / 2})`}
                  />
                </Svg>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                delayLongPress={LONG_PRESS_DELAY_MS}
                disabled={phase !== 'idle'}
                onLongPress={handleFingerprintPress}
                style={[
                  styles.fingerprintButton,
                  (isSealing || isCommitted) && styles.fingerprintButtonActive,
                ]}
              >
                <View style={styles.fingerprintContainer}>
                  <Icon
                    source={isCommitted ? 'check' : 'passport-biometric'}
                    size={54}
                    color={isCommitted ? colors.primary : colors.text}
                  />
                </View>
              </TouchableOpacity>

              {(isSealing || isCommitted) && (
                <Animated.Text
                  style={[
                    styles.centerText,
                    isCommitted && {
                      transform: [{ scale: committedTextScale }],
                    },
                  ]}
                >
                  {t(
                    isCommitted
                      ? 'onboarding.commitment.commit'
                      : 'onboarding.commitment.sealing'
                  )}
                </Animated.Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            label={t('common.confirm')}
            onPress={handleConfirm}
            type="primary"
            disabled={phase !== 'committed'}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 34,
    height: 34,
  },
  content: {
    alignItems: 'center',
    paddingTop: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fontWeights.bold,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 18,
  },
  description: {
    color: colors.text,
    fontFamily: fontWeights.regular,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 330,
  },
  descriptionBold: {
    fontFamily: fontWeights.bold,
  },
  promiseText: {
    color: colors.text,
    fontFamily: fontWeights.bold,
    fontSize: 18,
    lineHeight: 26,
    marginTop: 16,
    textAlign: 'center',
  },
  trustContainer: {
    ...colors.dropShadow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 24,
  },
  trustText: {
    color: colors.text,
    flex: 1,
    fontFamily: fontWeights.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  bottomSection: {
    alignItems: 'center',
    marginTop: 34,
  },
  tapToCommit: {
    color: colors.textLight,
    fontFamily: fontWeights.regular,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 290,
    textAlign: 'center',
  },
  tapBold: {
    color: colors.text,
    fontFamily: fontWeights.semibold,
  },
  tapSub: {
    color: colors.textLight,
    fontFamily: fontWeights.regular,
  },
  fingerprintSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    width: FINGERPRINT_SIZE,
    height: FINGERPRINT_SIZE,
  },
  progressSvg: {
    position: 'absolute',
  },
  fingerprintButton: {
    width: INNER_FINGERPRINT_SIZE,
    height: INNER_FINGERPRINT_SIZE,
    borderRadius: INNER_FINGERPRINT_SIZE / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...colors.dropShadow,
  },
  fingerprintButtonActive: {
    backgroundColor: '#EEF8F2',
  },
  fingerprintContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(42, 52, 71, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  centerText: {
    color: colors.primary,
    fontFamily: fontWeights.semibold,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 160,
    position: 'absolute',
    textAlign: 'center',
  },
  buttonContainer: {
    minHeight: 54,
    marginTop: 32,
  },
});

export default Commitment;
