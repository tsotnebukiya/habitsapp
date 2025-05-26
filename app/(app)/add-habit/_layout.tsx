import { ACTIVE_OPACITY } from '@/components/shared/config';
import toastConfig from '@/components/shared/toastConfig';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router, Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function AddHabitLayout() {
  const resetForm = useAddHabitStore((state) => state.resetForm);
  const pathname = usePathname();
  const backButton = pathname !== '/add-habit';
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

        <Text style={styles.heading}>Add New Habit</Text>
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
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="template-selection"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="create-habit"
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
      <Toast config={toastConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 18,
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
