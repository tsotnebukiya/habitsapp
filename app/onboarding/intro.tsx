import Paginator from '@/components/onboarding/Paginator';
import Button from '@/components/shared/Button';
import { ACTIVE_OPACITY_WHITE } from '@/components/shared/config';
import { languages } from '@/lib/constants/languages';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export type OnboardingItem = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
};

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

const OnboardingCarousel = () => {
  const insets = useSafeAreaInsets();
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const { t } = useTranslation();

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
        <Image
          source={languages[currentLanguage].onboardingImages[index]}
          style={styles.onboardingImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>{t(item.titleKey as any)}</Text>
        <Text style={styles.description}>{t(item.descriptionKey as any)}</Text>
      </View>
    );
  };

  const handleBack = () => {
    flatListRef.current?.scrollToIndex({
      index: currentIndex - 1,
      animated: true,
    });
  };

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      router.push('/onboarding/wizard');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleLanguage = () => {
    router.push('/language');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 11 },
      ]}
    >
      <View style={styles.header}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={ACTIVE_OPACITY_WHITE}
          >
            <Icon
              source={require('@/assets/icons/chevron-left.png')}
              size={18}
              color="black"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <TouchableOpacity
          onPress={handleLanguage}
          style={styles.languageButton}
          activeOpacity={ACTIVE_OPACITY_WHITE}
        >
          <Image
            source={languages[currentLanguage].icon}
            style={styles.languageIcon}
          />
          <Text style={styles.languageLabel}>
            {languages[currentLanguage].label}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        contentContainerStyle={styles.flatList}
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

      <Paginator data={slides} scrollX={scrollX} />

      <View style={styles.bottomContainer}>
        <Button
          onPress={handleNext}
          type="primary"
          fullWidth
          label={t('onboarding.next')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 23,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButton: {
    backgroundColor: 'white',
    borderRadius: 70,
    padding: 8,
    gap: 8,
    flexDirection: 'row',
  },
  languageIcon: {
    width: 18,
    height: 18,
  },
  languageLabel: {
    fontFamily: fontWeights.medium,
    fontSize: 13,
    color: colors.text,
  },
  spacer: {
    width: 34,
    height: 34,
  },
  flatList: {
    alignItems: 'baseline',
  },
  slide: {
    width: screenWidth,
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  image: {
    marginBottom: 66,
  },
  title: {
    marginBottom: 9,
    fontFamily: fontWeights.bold,
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  description: {
    fontFamily: fontWeights.regular,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    height: 54,
  },
  onboardingImage: {
    width: '100%',
    height: 343,
    marginBottom: 66,
  },
});

export default OnboardingCarousel;
