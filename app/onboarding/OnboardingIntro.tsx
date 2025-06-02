import { colors } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import useUserProfileStore from '@/lib/stores/user_profile';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type OnboardingItem = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
};

const OnboardingCarousel = () => {
  const insets = useSafeAreaInsets();
  const profile = useUserProfileStore((state) => state.profile);
  console.log(profile?.preferred_language);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const { t } = useTranslation();

  const slides: OnboardingItem[] = [
    {
      id: '1',
      titleKey: 'onboarding.welcome.title',
      descriptionKey: 'onboarding.welcome.description',
      icon: 'rocket',
    },
    {
      id: '2',
      titleKey: 'onboarding.track.title',
      descriptionKey: 'onboarding.track.description',
      icon: 'chart-line',
    },
    {
      id: '3',
      titleKey: 'onboarding.start.title',
      descriptionKey: 'onboarding.start.description',
      icon: 'flag-checkered',
    },
  ];

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
        {/* <FontAwesome6
          name={item.icon as any}
          size={80}
          color={colors.bgDark}
          style={styles.image}
        /> */}
        <Text style={styles.title}>{t(item.titleKey as any)}</Text>
        <Text style={styles.description}>{t(item.descriptionKey as any)}</Text>
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
              currentIndex === index ? colors.bgDark : colors.bgDark,
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 17 }]}>
      {/* <StatusBar barStyle="dark-content" /> */}

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
        <TouchableOpacity onPress={handleNext}>
          <Text>
            {currentIndex === slides.length - 1
              ? t('onboarding.getStarted')
              : t('onboarding.next')}
          </Text>
          <FontAwesome6 name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  slide: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  image: {
    marginBottom: 66,
  },
  title: {
    marginBottom: 9,
  },
  description: {},
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
});

export default OnboardingCarousel;
