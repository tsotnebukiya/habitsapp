import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { fontWeights } from '@/lib/constants/ui';
import {
  type OnboardingItem,
  useOnboardingStore,
} from '@/lib/stores/onboardingStore';
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                Progress Text                               */
/* -------------------------------------------------------------------------- */

function ProgressMessages({
  onComplete,
  isActive = true,
}: {
  onComplete?: () => void;
  isActive?: boolean;
}) {
  const { variant } = useOnboardingStore();
  const { t } = useTranslation();

  /* ------------------------------ local state ----------------------------- */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  /* ------------------------------- timers --------------------------------- */
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const clearTimers = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    intervalId.current = null;
    timeoutId.current = null;
  };

  /* ----------------------------- label set -------------------------------- */
  const strings = useMemo(() => {
    const v = variant || 'quick';
    switch (v) {
      case 'standard':
        return [
          t('onboarding.loading.standard.analyzing'),
          t('onboarding.loading.standard.buildingProfile'),
          t('onboarding.loading.standard.preparingDashboard'),
          t('onboarding.loading.standard.almostReady'),
        ];
      case 'preview':
        return [
          t('onboarding.loading.preview.processing'),
          t('onboarding.loading.preview.preparingPreview'),
          t('onboarding.loading.preview.almostReady'),
        ];
      case 'complete':
        return [
          t('onboarding.loading.complete.analyzing'),
          t('onboarding.loading.complete.calculating'),
          t('onboarding.loading.complete.buildingProfile'),
          t('onboarding.loading.complete.almostReady'),
        ];
      case 'quick':
      default:
        return [
          t('onboarding.loading.quick.settingUp'),
          t('onboarding.loading.quick.preparingDashboard'),
          t('onboarding.loading.quick.almostReady'),
        ];
    }
  }, [variant, t]);

  /* -------------------- pause / resume when slide hidden ------------------ */
  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setDisplayText('');
      setIsTyping(true);
      return;
    }
    // resume automatically handled by next effect
  }, [isActive]);

  /* --------------------------- typing sequence ---------------------------- */
  useEffect(() => {
    if (!isActive || hasCompleted) return;

    const currentString = strings[currentIndex];
    let charIndex = 0;

    intervalId.current = setInterval(() => {
      if (charIndex <= currentString.length) {
        setDisplayText(currentString.slice(0, charIndex));
        charIndex += 1;
      } else {
        clearTimers();
        setIsTyping(false);

        /* ------------------ wait then advance / finish ------------------ */
        timeoutId.current = setTimeout(() => {
          const isLast = currentIndex === strings.length - 1;
          if (isLast) {
            setHasCompleted(true);
            onComplete?.();
          } else {
            setCurrentIndex((i) => i + 1);
            setDisplayText('');
            setIsTyping(true);
          }
        }, 1500);
      }
    }, 50);

    return clearTimers; // run on unmount or dependency change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isActive, hasCompleted]);

  /* ----------------------------------------------------------------------- */

  return (
    <View style={styles.textContainer}>
      <Text style={styles.text}>
        {displayText}
        {isTyping && <Text style={styles.cursor}>|</Text>}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Loader Wrapper                               */
/* -------------------------------------------------------------------------- */

interface LoadingScreenProps {
  item: OnboardingItem;
  onComplete?: () => void;
  isActive?: boolean;
}

export default function LoadingScreen({
  item,
  onComplete,
  isActive = true,
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/onboarding/loading.gif')}
        style={styles.gif}
      />
      <ProgressMessages onComplete={onComplete} isActive={isActive} />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    CSS                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    marginVertical: 'auto',
  },
  gif: {
    width: 164,
    height: 164,
    alignSelf: 'center',
  },
  textContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  text: {
    fontFamily: fontWeights.bold,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  cursor: {
    opacity: 0.7,
  },
});
