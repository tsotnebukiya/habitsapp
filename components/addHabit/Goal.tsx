import { ACTIVE_OPACITY } from '@/components/shared/config';
import {
  MeasurementUnit,
  MeasurementUnits,
} from '@/lib/constants/MeasurementUnits';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { Icon, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

const data = Object.values(MeasurementUnits).map((unit, i) => ({
  key: i,
  label: unit.name,
  value: unit,
}));

type UnitType = (typeof data)[number];

type GoalFormData = {
  goal: {
    value: number;
    unit: MeasurementUnit;
  };
};

export default function GoalChoosing({
  formData,
  setFormField,
}: {
  formData: GoalFormData;
  setFormField: <K extends keyof GoalFormData>(
    field: K,
    value: GoalFormData[K]
  ) => void;
}) {
  const insets = useSafeAreaInsets();
  const modalSelectorRef = useRef<any>(null);
  const { t } = useTranslation();

  const [tempData, setTempData] = useState<{
    value: number;
    unit: MeasurementUnit;
  }>({
    value: formData.goal.value,
    unit: formData.goal.unit,
  });

  const handleSelectUnit = (option: UnitType) => {
    setTempData({
      value: tempData.value,
      unit: option.value,
    });
  };

  const handleSubmit = () => {
    setFormField('goal', tempData);
    router.back();
  };

  const goalText =
    tempData.value === 1 ? tempData.unit.oneName : tempData.unit.name;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t('habits.selectGoal')}</Text>
      </View>
      <View style={styles.goalContainer}>
        <View style={styles.itemContainer}>
          <View style={styles.item}>
            <MaterialIcons name="flag" size={24} color={'#42A5F5'} />
            <Text style={styles.itemText}>{t('habits.goalLabel')}</Text>
            <View style={styles.itemRight}>
              <View>
                <TextInput
                  style={styles.searchInput}
                  outlineStyle={styles.searchOutline}
                  mode="outlined"
                  value={tempData.value.toString()}
                  inputMode="numeric"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    setTempData({
                      value: Number(text),
                      unit: tempData.unit,
                    });
                  }}
                />
              </View>
              <Text style={styles.goalText}>{goalText.toLowerCase()}</Text>
            </View>
          </View>
          <ModalSelector
            data={data}
            cancelText={t('common.cancel')}
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
                <Text style={styles.itemText}>{t('habits.goalLabel')}</Text>
                <View style={[styles.itemRight]}>
                  <Text style={styles.itemUnit}>{tempData.unit.name}</Text>
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
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          onPress={handleSubmit}
          label={t('common.done')}
          type="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.container,
  header: sharedStyles.header,
  heading: sharedStyles.heading,
  footer: sharedStyles.footer,
  goalContainer: {
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
