import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/utils/i18n';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LanguageScreen() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    router.back();
  };

  const handleLanguageSelect = async (languageCode: SupportedLanguage) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacing} />

        <Text style={styles.heading}>{t('settings.language')}</Text>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.1}
          style={styles.closeButton}
        >
          <Icon
            source={require('@/assets/icons/x-close.png')}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.subContainer}>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name], index) => {
            const isSelected = code === currentLanguage;
            const isLast =
              index === Object.entries(SUPPORTED_LANGUAGES).length - 1;

            return (
              <TouchableOpacity
                key={code}
                style={[styles.item, isLast && styles.lastItem]}
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => handleLanguageSelect(code as SupportedLanguage)}
              >
                <Text style={styles.languageText}>{name}</Text>
                {isSelected && (
                  <Icon
                    source={require('@/assets/icons/checklight.png')}
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    marginBottom: 20,
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  heading: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    textAlign: 'center',
    color: colors.text,
  },
  mainContainer: {
    ...colors.dropShadow,
  },
  subContainer: {
    backgroundColor: colors.border,
    gap: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 16.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageText: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});
