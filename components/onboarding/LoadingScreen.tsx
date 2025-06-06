import React, { useEffect, useState } from 'react';
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

// Option 3: Progress Messages with typewriter effect
function ProgressMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
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
          // Wait before moving to next message
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % strings.length);
            setDisplayText('');
            setIsTyping(true);
          }, 1500);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [currentIndex, isTyping]);

  return (
    <View style={styles.textContainer}>
      <Text style={styles.text}>
        {displayText}
        {isTyping && <Text style={styles.cursor}>|</Text>}
      </Text>
    </View>
  );
}

export default function LoadingScreen({ item }: { item: OnboardingItem }) {
  // You can switch between these three options by changing the component below

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/onboarding/loading.gif')}
        style={styles.gif}
      />
      <ProgressMessages />
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
