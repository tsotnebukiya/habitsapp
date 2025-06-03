import {
  ACTIVE_OPACITY,
  ACTIVE_OPACITY_WHITE,
} from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useHabit } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useUpdateHabitStore } from '@/lib/stores/update_habit_store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router, Stack, useLocalSearchParams, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

export default function UpdateHabitLayout() {
  const { t } = useTranslation();
  const resetForm = useUpdateHabitStore((state) => state.resetForm);
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const habit = useHabit(habitId);
  const pathname = usePathname();
  const backButton = pathname !== '/update-habit';
  const handleClose = () => {
    router.replace('/');
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);
  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          {backButton ? (
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={ACTIVE_OPACITY}
              style={styles.backButton}
            >
              <Icon
                source={require('@/assets/icons/chevron-left.png')}
                size={18}
                color="black"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacing} />
          )}

          <Text style={styles.heading}>
            {t('common.edit')} {habit?.name}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={ACTIVE_OPACITY_WHITE}
            style={styles.closeButton}
          >
            <Icon
              source={require('@/assets/icons/x-close.png')}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="detail-choosing"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
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
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
