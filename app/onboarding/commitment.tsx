import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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
const BACKGROUND_CIRCLE_SIZE = 80;
const STROKE_WIDTH = 8;
const SEAL_DURATION_MS = 1000;
const LONG_PRESS_DELAY_MS = 500;
const AUTO_CONTINUE_DELAY_MS = 2000;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CommitmentPhase = 'idle' | 'sealing' | 'committed';

function Commitment() {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  const router = useRouter();
  const { t } = useTranslation();
  const { capture, screen } = useOnboardingAnalytics();
  const setResumeRoute = useOnboardingStore((state) => state.setResumeRoute);
  const [phase, setPhase] = useState<CommitmentPhase>('idle');
  const layoutScale = screenHeight < 760 ? 0.8 : screenHeight < 880 ? 0.88 : 1;
  const fingerprintSize = Math.round(FINGERPRINT_SIZE * layoutScale);
  const innerFingerprintSize = Math.round(INNER_FINGERPRINT_SIZE * layoutScale);
  const fingerprintCoreSize = Math.round(150 * layoutScale);
  const fingerprintIconSize = Math.round(58 * layoutScale);
  const committedBadgeSize = Math.round(88 * layoutScale);
  const committedIconSize = Math.round(34 * layoutScale);
  const committedBadgeBorder = Math.max(4, Math.round(5 * layoutScale));
  const copySpacing = screenHeight < 760 ? 14 : 18;
  const blockSpacing = screenHeight < 760 ? 18 : 24;
  const fingerprintSpacing = screenHeight < 760 ? 16 : 22;

  const sealProgress = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const screenWashOpacity = useRef(new Animated.Value(0)).current;
  const committedHaloOpacity = useRef(new Animated.Value(1)).current;
  const committedHaloScale = useRef(new Animated.Value(1)).current;
  const fingerprintPulse = useRef(new Animated.Value(0)).current;
  const fingerprintShake = useRef(new Animated.Value(0)).current;
  const fingerprintOpacity = useRef(new Animated.Value(1)).current;
  const sealingTextOpacity = useRef(new Animated.Value(0)).current;
  const committedContentOpacity = useRef(new Animated.Value(0)).current;
  const committedContentScale = useRef(new Animated.Value(0.92)).current;

  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const ringAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const overlayAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const committedAnimationRef = useRef<Animated.CompositeAnimation | null>(
    null
  );
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hapticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoContinueTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const radius = useMemo(
    () => (fingerprintSize - STROKE_WIDTH) / 2,
    [fingerprintSize]
  );
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = useMemo(
    () =>
      Animated.multiply(Animated.subtract(1, sealProgress), circumference),
    [circumference, sealProgress]
  );

  const fingerprintScale = fingerprintPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });
  const fingerprintTranslateY = fingerprintPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });
  const fingerprintTranslateX = fingerprintShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-2, 0, 2],
  });
  const ringOpacity = sealProgress.interpolate({
    inputRange: [0, 0.08, 1],
    outputRange: [0, 1, 1],
  });

  useEffect(() => {
    setResumeRoute('/onboarding/commitment');
    screen('onboarding_commitment');
    capture('commitment_screen_viewed');
  }, [capture, screen, setResumeRoute]);

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

  const stopActiveAnimations = () => {
    pulseLoopRef.current?.stop();
    pulseLoopRef.current = null;
    shakeLoopRef.current?.stop();
    shakeLoopRef.current = null;
    ringAnimationRef.current?.stop();
    ringAnimationRef.current = null;
    overlayAnimationRef.current?.stop();
    overlayAnimationRef.current = null;
    committedAnimationRef.current?.stop();
    committedAnimationRef.current = null;
  };

  const resetAnimationValues = () => {
    sealProgress.setValue(0);
    overlayScale.setValue(0);
    overlayOpacity.setValue(0);
    screenWashOpacity.setValue(0);
    committedHaloOpacity.setValue(1);
    committedHaloScale.setValue(1);
    fingerprintPulse.setValue(0);
    fingerprintShake.setValue(0);
    fingerprintOpacity.setValue(1);
    sealingTextOpacity.setValue(0);
    committedContentOpacity.setValue(0);
    committedContentScale.setValue(0.92);
  };

  useEffect(() => {
    return () => {
      clearPendingTimers();
      stopActiveAnimations();
      resetAnimationValues();
    };
  }, []);

  const startSealPulse = () => {
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fingerprintPulse, {
          toValue: 1,
          duration: 170,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fingerprintPulse, {
          toValue: 0,
          duration: 170,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current.start();

    shakeLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fingerprintShake, {
          toValue: 1,
          duration: 70,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fingerprintShake, {
          toValue: -1,
          duration: 70,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fingerprintShake, {
          toValue: 0,
          duration: 70,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    shakeLoopRef.current.start();
  };

  const handleCommitted = () => {
    clearPendingTimers();
    stopActiveAnimations();
    setPhase('committed');

    capture('commitment_completed', {
      commitment_method: 'long_press',
    });

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    fingerprintPulse.setValue(0);
    fingerprintShake.setValue(0);
    fingerprintOpacity.setValue(0);
    sealingTextOpacity.setValue(0);
    committedContentOpacity.setValue(0);
    committedContentScale.setValue(0.92);

    overlayAnimationRef.current = Animated.parallel([
      Animated.timing(screenWashOpacity, {
        toValue: 0.05,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.04,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(committedHaloOpacity, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(committedHaloScale, {
        toValue: 0.8,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    overlayAnimationRef.current.start();

    committedAnimationRef.current = Animated.parallel([
      Animated.timing(committedContentOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(committedContentScale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]);
    committedAnimationRef.current.start();

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
    stopActiveAnimations();
    resetAnimationValues();
    setPhase('sealing');

    capture('commitment_fingerprint_pressed', {
      commitment_method: 'long_press',
    });

    startSealPulse();
    sealingTextOpacity.setValue(1);

    const { width, height } = Dimensions.get('window');
    const diagonal = Math.sqrt(width ** 2 + height ** 2);
    const targetScale = (diagonal * 2) / BACKGROUND_CIRCLE_SIZE;

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

    ringAnimationRef.current = Animated.timing(sealProgress, {
      toValue: 1,
      duration: SEAL_DURATION_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    });

    overlayAnimationRef.current = Animated.parallel([
      Animated.timing(overlayScale, {
        toValue: targetScale,
        duration: SEAL_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 0.28,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.24,
          duration: SEAL_DURATION_MS - 220,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(screenWashOpacity, {
        toValue: 0.22,
        duration: SEAL_DURATION_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([ringAnimationRef.current, overlayAnimationRef.current]).start(
      ({ finished }) => {
        if (finished) {
          handleCommitted();
        }
      }
    );
  };

  const handleConfirm = () => {
    if (phase !== 'committed') {
      return;
    }

    clearPendingTimers();
    setResumeRoute('/onboarding/login');
    router.replace('/onboarding/login');
  };

  const handleBack = () => {
    capture('commitment_back_button_pressed');
    clearPendingTimers();
    stopActiveAnimations();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/onboarding/intro');
  };

  const isCommitted = phase === 'committed';
  const isSealing = phase === 'sealing';

  return (
    <ImageBackground
      source={require('@/assets/onboarding/gradient.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.screenWash,
          {
            opacity: screenWashOpacity,
          },
        ]}
      />

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: 24 },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              style={styles.backButton}
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
            <Text style={[styles.title, { marginBottom: copySpacing }]}>
              {t('onboarding.commitment.title')}
            </Text>

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

            <Text style={[styles.promiseText, { marginTop: copySpacing - 2 }]}>
              {t('onboarding.commitment.commit')}
            </Text>

            <View style={[styles.trustContainer, { marginTop: blockSpacing }]}>
              <Icon source="handshake" size={18} color={colors.primary} />
              <Text style={styles.trustText}>
                {t('onboarding.commitment.trust')}
              </Text>
            </View>

            <View style={[styles.commitSection, { marginTop: blockSpacing + 2 }]}>
              <Text style={styles.tapToCommit}>
                <Text style={styles.tapBold}>
                  {t('onboarding.commitment.tapBold')}
                </Text>{' '}
                <Text style={styles.tapSub}>
                  {t('onboarding.commitment.tapSub')}
                </Text>
              </Text>

              <View
                style={[
                  styles.fingerprintSection,
                  {
                    height: fingerprintSize,
                    marginTop: fingerprintSpacing,
                    width: fingerprintSize,
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.animatedOverlay,
                    {
                      opacity: overlayOpacity,
                      transform: [{ scale: overlayScale }],
                    },
                  ]}
                />

                {(isSealing || isCommitted) && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.progressSvg,
                      {
                        opacity: isCommitted
                          ? committedHaloOpacity
                          : ringOpacity,
                        transform: isCommitted
                          ? [{ scale: committedHaloScale }]
                          : undefined,
                      },
                    ]}
                  >
                    <Svg width={fingerprintSize} height={fingerprintSize}>
                      <Circle
                        cx={fingerprintSize / 2}
                        cy={fingerprintSize / 2}
                        r={radius}
                        strokeWidth={STROKE_WIDTH}
                        stroke="rgba(59, 170, 116, 0.14)"
                        fill="transparent"
                      />
                      <AnimatedCircle
                        cx={fingerprintSize / 2}
                        cy={fingerprintSize / 2}
                        r={radius}
                        strokeWidth={STROKE_WIDTH}
                        stroke={colors.primary}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90, ${fingerprintSize / 2}, ${fingerprintSize / 2})`}
                      />
                    </Svg>
                  </Animated.View>
                )}

                <Animated.View
                  style={{
                    opacity: fingerprintOpacity,
                    transform: [
                      { translateX: fingerprintTranslateX },
                      { translateY: fingerprintTranslateY },
                      { scale: fingerprintScale },
                    ],
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.86}
                    delayLongPress={LONG_PRESS_DELAY_MS}
                    disabled={phase !== 'idle'}
                    onLongPress={handleFingerprintPress}
                    style={[
                      styles.fingerprintButton,
                      {
                        borderRadius: innerFingerprintSize / 2,
                        height: innerFingerprintSize,
                        width: innerFingerprintSize,
                      },
                      (isSealing || isCommitted) && styles.fingerprintButtonActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.fingerprintBackground,
                        {
                          borderRadius: fingerprintCoreSize / 2,
                          height: fingerprintCoreSize,
                          width: fingerprintCoreSize,
                        },
                      ]}
                    >
                      <Icon
                        source="fingerprint"
                        size={fingerprintIconSize}
                        color={colors.text}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {isCommitted && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.committedBadge,
                      {
                        opacity: committedContentOpacity,
                        transform: [{ scale: committedContentScale }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.committedHalo,
                        {
                          height: Math.round(committedBadgeSize * 1.9),
                          width: Math.round(committedBadgeSize * 1.9),
                          borderRadius: Math.round(committedBadgeSize * 0.95),
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.committedIconCircle,
                        {
                          borderRadius: committedBadgeSize / 2,
                          borderWidth: committedBadgeBorder,
                          height: committedBadgeSize,
                          width: committedBadgeSize,
                        },
                      ]}
                    >
                      <Icon
                        source="check"
                        size={committedIconSize}
                        color="white"
                      />
                    </View>
                  </Animated.View>
                )}
              </View>

              <View
                style={[
                  styles.overlayTextContainer,
                  { marginTop: Math.max(8, fingerprintSpacing - 6) },
                ]}
              >
                {isSealing && (
                  <Animated.Text
                    style={[
                      styles.sealingText,
                      {
                        opacity: sealingTextOpacity,
                      },
                    ]}
                  >
                    {t('onboarding.commitment.sealing')}
                  </Animated.Text>
                )}

                {isCommitted && (
                  <Animated.Text
                    style={[
                      styles.committedText,
                      {
                        opacity: committedContentOpacity,
                        transform: [{ scale: committedContentScale }],
                      },
                    ]}
                  >
                    {t('onboarding.commitment.committed')}
                  </Animated.Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 12, 24) },
          ]}
        >
          <View style={styles.buttonContainer}>
            <Button
              label={t('common.confirm')}
              onPress={handleConfirm}
              type="primary"
              disabled={phase !== 'committed'}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  screenWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 100,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  headerSpacer: {
    height: 34,
    width: 34,
  },
  content: {
    alignItems: 'center',
    paddingTop: 6,
  },
  title: {
    color: colors.text,
    fontFamily: fontWeights.bold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  description: {
    color: colors.text,
    fontFamily: fontWeights.regular,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 330,
    textAlign: 'center',
  },
  descriptionBold: {
    fontFamily: fontWeights.bold,
  },
  promiseText: {
    color: colors.text,
    fontFamily: fontWeights.bold,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  trustContainer: {
    ...colors.dropShadow,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  trustText: {
    color: colors.text,
    flex: 1,
    fontFamily: fontWeights.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  commitSection: {
    alignItems: 'center',
    width: '100%',
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
    overflow: 'visible',
  },
  animatedOverlay: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: BACKGROUND_CIRCLE_SIZE / 2,
    height: BACKGROUND_CIRCLE_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    width: BACKGROUND_CIRCLE_SIZE,
  },
  progressSvg: {
    position: 'absolute',
  },
  fingerprintButton: {
    ...colors.dropShadow,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  fingerprintButtonActive: {
    backgroundColor: '#F2FBF6',
  },
  fingerprintBackground: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(42, 52, 71, 0.12)',
    borderWidth: 1,
    justifyContent: 'center',
  },
  committedBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  committedHalo: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 170, 116, 0.14)',
  },
  committedIconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: 'white',
    justifyContent: 'center',
    ...colors.dropShadow,
  },
  overlayTextContainer: {
    alignItems: 'center',
    minHeight: 24,
  },
  sealingText: {
    color: colors.primary,
    fontFamily: fontWeights.semibold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  committedText: {
    color: colors.primary,
    fontFamily: fontWeights.bold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  buttonContainer: {
    minHeight: 54,
  },
});

export default Commitment;
