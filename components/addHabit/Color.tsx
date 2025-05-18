import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

export default function ColorChoosing() {
  const insets = useSafeAreaInsets();
  const setFormField = useAddHabitStore((state) => state.setFormField);
  const selectedColor = useAddHabitStore((state) => state.formData.color);
  const [tempColor, setTempColor] = useState<string>(selectedColor);

  const handleSelectColor = (color: string) => {
    setTempColor(color);
  };

  const handleSubmit = () => {
    setFormField('color', tempColor as any);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select color</Text>
      </View>
      <View style={styles.colorGrid}>
        {Object.values(colors.habitColors).map((color, i) => {
          const isSelected = color === tempColor;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={ACTIVE_OPACITY}
              style={[
                styles.circle,
                { backgroundColor: color },
                isSelected && styles.circleBorder,
              ]}
              onPress={() => handleSelectColor(color)}
            >
              {isSelected && (
                <Icon source={require('@/assets/icons/check.png')} size={24} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button onPress={handleSubmit} label="Done" type="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.container,
  header: sharedStyles.header,
  heading: sharedStyles.heading,
  footer: sharedStyles.footer,
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 19,
    paddingTop: 24,
  },
  circle: {
    width: 57,
    height: 57,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBorder: {
    borderWidth: 5,
    borderColor: 'white',
  },
});
