import Colors from '@/lib/constants/Colors';
import { ACTIVE_OPACITY } from '@/lib/constants/layouts';
import { fontWeights } from '@/lib/constants/Typography';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon, RadioButton } from 'react-native-paper';

export default function TypeChoosing() {
  const selectedType = useAddHabitStore((state) => state.formData.type);
  const setFormField = useAddHabitStore((state) => state.setFormField);
  const handleTypeSelect = (type: 'GOOD' | 'BAD') => {
    setFormField('type', type);
    router.back();
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={ACTIVE_OPACITY}
        style={styles.itemContainer}
        onPress={() => handleTypeSelect('GOOD')}
      >
        <MaterialIcons
          name="check-circle"
          size={24}
          color={Colors.habitColors.meadowGreen}
        />
        <Text style={styles.itemText}>Good</Text>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            value={selectedType}
            status={selectedType === 'GOOD' ? 'checked' : 'unchecked'}
            color={Colors.primary}
            onPress={() => handleTypeSelect('GOOD')}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={ACTIVE_OPACITY}
        style={styles.itemContainer}
        onPress={() => handleTypeSelect('BAD')}
      >
        <Icon source={require('@/assets/icons/badhabbit.png')} size={24} />
        <Text style={styles.itemText}>Bad</Text>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            value={selectedType}
            status={selectedType === 'BAD' ? 'checked' : 'unchecked'}
            color={Colors.primary}
            onPress={() => handleTypeSelect('BAD')}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    ...Colors.dropShadow,
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 24,
  },
  itemText: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: 'black',
  },
  itemTextActive: {
    fontFamily: fontWeights.semibold,
  },
  radioButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
