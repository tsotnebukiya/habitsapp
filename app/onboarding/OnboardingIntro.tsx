// app/onboarding/OnboardingIntro.tsx
// app/onboarding/OnboardingCarousel.tsx
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FontAwesome6 } from '@expo/vector-icons';
import Colors from '@/lib/constants/Colors';

const { width, height } = Dimensions.get('window');

type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const slides: OnboardingItem[] = [
  {
    id: '1',
    title: 'Welcome to [Your App]',
    description:
      'Your all-in-one solution for managing your daily tasks and achieving your goals.',
    icon: 'rocket',
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description:
      'Set goals, track your progress, and celebrate your achievements along the way.',
    icon: 'chart-line',
  },
  {
    id: '3',
    title: "Let's Get Started",
    description:
      'Join our community of achievers and start your journey today.',
    icon: 'flag-checkered',
  },
];

const OnboardingCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = ({ changed }: { changed: ViewToken[] }) => {
    if (changed && changed[0].index !== null) {
      setCurrentIndex(changed[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const renderItem = ({
    item,
    index,
  }: {
    item: OnboardingItem;
    index: number;
  }) => {
    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer]}>
          <FontAwesome6
            name={item.icon as any}
            size={80}
            color={Colors.shared.primary[500]}
          />
        </Animated.View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      router.push('/onboarding/OnboardingLogin');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const PaginationDot = ({ index }: { index: number }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const width = interpolate(
        currentIndex,
        [index - 1, index, index + 1],
        [8, 20, 8]
      );

      const opacity = interpolate(
        currentIndex,
        [index - 1, index, index + 1],
        [0.5, 1, 0.5]
      );

      return {
        width: withSpring(width),
        opacity: withSpring(opacity),
      };
    });

    return (
      <Animated.View
        style={[
          styles.dot,
          animatedDotStyle,
          {
            backgroundColor:
              currentIndex === index
                ? Colors.shared.primary[500]
                : Colors.shared.neutral[300],
          },
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <PaginationDot key={index} index={index} />
        ))}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <FontAwesome6
            name="arrow-right"
            size={16}
            color="white"
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: Colors.shared.neutral[500],
    fontWeight: '500',
  },
  slide: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.shared.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.shared.neutral[900],
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.shared.neutral[600],
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: Colors.shared.primary[500],
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingCarousel;
