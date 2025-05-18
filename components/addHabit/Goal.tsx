import { ACTIVE_OPACITY } from '@/components/shared/config';
import { MeasurementUnits } from '@/lib/constants/measurementUnits';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { Icon, TextInput } from 'react-native-paper';

export default function GoalChoosing() {
  type UnitType = (typeof data)[number];
  const modalSelectorRef = useRef<any>(null);
  const formData = useAddHabitStore((state) => state.formData);
  const setFormData = useAddHabitStore((state) => state.setFormField);
  const data = Object.values(MeasurementUnits).map((unit, i) => ({
    key: i,
    label: unit.name,
    value: unit,
  }));

  const handleSelectUnit = (option: UnitType) => {
    setFormData('goal', {
      ...formData.goal,
      unit: option.value,
    });
  };

  const goalText =
    formData.goal.value === 1
      ? formData.goal.unit.oneName
      : formData.goal.unit.name;
  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <View style={styles.item}>
          <MaterialIcons name="flag" size={24} color={'#42A5F5'} />
          <Text style={styles.itemText}>Goal</Text>
          <View style={styles.itemRight}>
            <View>
              <TextInput
                style={styles.searchInput}
                outlineStyle={styles.searchOutline}
                mode="outlined"
                value={formData.goal.value.toString()}
                inputMode="numeric"
                keyboardType="numeric"
                onChangeText={(text) => {
                  setFormData('goal', {
                    ...formData.goal,
                    value: Number(text),
                  });
                }}
              />
            </View>
            <Text style={styles.goalText}>{goalText.toLowerCase()}</Text>
          </View>
        </View>
        <ModalSelector
          data={data}
          cancelText="Cancel"
          animationType="fade"
          ref={modalSelectorRef}
          onChange={(option: UnitType) => handleSelectUnit(option)}
          customSelector={
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              style={[styles.item]}
              onPress={() =>
                modalSelectorRef.current && modalSelectorRef.current.open()
              }
            >
              <MaterialIcons
                name="layers"
                size={24}
                color={colors.habitColors.salmonRed}
              />
              <Text style={styles.itemText}>Goal</Text>
              <View style={[styles.itemRight]}>
                <Text style={styles.itemUnit}>{formData.goal.unit.name}</Text>
                <Icon
                  source={require('@/assets/icons/chevron-right.png')}
                  size={24}
                  color={colors.text}
                />
              </View>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  itemContainer: {
    backgroundColor: colors.border,
    gap: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 16.5,
    gap: 8.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  itemUnit: {
    fontSize: 12,
    fontFamily: fontWeights.semibold,
    color: colors.text,
  },
  itemRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  searchInput: {
    borderRadius: 7,
    backgroundColor: 'white',
    fontSize: 13,
    fontFamily: fontWeights.regular,
    color: colors.text,
    height: 26,
    width: 50,
    textAlign: 'center',
  },
  searchOutline: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalText: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
    opacity: 0.5,
  },
});
