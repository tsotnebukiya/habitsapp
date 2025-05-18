import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

export default function ColorChoosing() {
  const setFormField = useAddHabitStore((state) => state.setFormField);
  const selectedColor = useAddHabitStore((state) => state.formData.color);

  const handleSelectColor = (color: string) => {
    setFormField('color', color);
    router.back();
  };

  return (
    <View style={styles.colorGrid}>
      {Object.values(colors.habitColors).map((color, i) => {
        const isSelected = color === selectedColor;
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
  );
}

const styles = StyleSheet.create({
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
