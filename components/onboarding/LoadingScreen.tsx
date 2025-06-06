import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { fontWeights } from '@/lib/constants/ui';
import { type OnboardingItem } from '@/lib/stores/onboardingStore';

const { width: screenWidth } = Dimensions.get('window');

const strings = [
  'Setting up your account...',
  'Preparing your workspace...',
  'Syncing your data...',
  'Almost ready...',
];

// Progress Messages with typewriter effect
function ProgressMessages({
  onComplete,
  isActive,
  currentIndexList,
}: {
  onComplete?: () => void;
  isActive?: boolean;
  currentIndexList?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const onCompleteCalledRef = useRef(false);
  console.log('WEAREHEREOUTSIDE', currentIndexList);
  useEffect(() => {
    // Only run if this screen is active and hasn't completed yet
    console.log('WEAREHEREINSIDE', currentIndexList);
    if (!isActive || hasCompleted || onCompleteCalledRef.current) return;
    console.log('WEAREHERE', currentIndexList);
    const currentString = strings[currentIndex];

    if (isTyping) {
      // Typewriter effect
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= currentString.length) {
          setDisplayText(currentString.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);

          // Wait before moving to next message or completing
          const waitTimeout = setTimeout(() => {
            // If this was the last message, complete the sequencer
            if (currentIndex === strings.length - 1) {
              if (!onCompleteCalledRef.current) {
                onCompleteCalledRef.current = true;
                setHasCompleted(true);
                onComplete?.();
              }
              return;
            }

            // Otherwise, move to next message
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setDisplayText('');
            setIsTyping(true);
          }, 1500);

          // Cleanup timeout if component unmounts
          return () => clearTimeout(waitTimeout);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [currentIndex, isTyping, onComplete, hasCompleted, isActive]);

  // Reset when becoming active again
  useEffect(() => {
    if (isActive && hasCompleted) {
      setCurrentIndex(0);
      setDisplayText('');
      setIsTyping(true);
      setHasCompleted(false);
      onCompleteCalledRef.current = false;
    }
  }, [isActive, hasCompleted]);

  return (
    <View style={styles.textContainer}>
      <Text style={styles.text}>
        {displayText}
        {isTyping && <Text style={styles.cursor}>|</Text>}
      </Text>
    </View>
  );
}

interface LoadingScreenProps {
  item: OnboardingItem;
  onComplete?: () => void;
  isActive?: boolean;
  currentIndex?: number;
}

export default function LoadingScreen({
  item,
  onComplete,
  isActive = true,
  currentIndex,
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/onboarding/loading.gif')}
        style={styles.gif}
      />
      <ProgressMessages
        onComplete={onComplete}
        isActive={isActive}
        currentIndexList={currentIndex}
      />
    </View>
  );
}

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
    height: 50, // Fixed height to prevent layout shifts
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: fontWeights.medium,
  },
  activeButton: {
    backgroundColor: '#007AFF',
    color: 'white',
  },
});
