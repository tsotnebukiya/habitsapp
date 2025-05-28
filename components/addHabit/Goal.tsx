import { ACTIVE_OPACITY } from '@/components/shared/config';
import {
  MeasurementUnit,
  MeasurementUnits,
} from '@/lib/constants/MeasurementUnits';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { translateMeasurementUnit } from '@/lib/utils/translationHelpers';
import { MaterialIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { t } = useTranslation();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [tempData, setTempData] = useState<{
    value: number;
    unit: MeasurementUnit;
  }>({
    value: formData.goal.value,
    unit: formData.goal.unit,
  });

  const handleSelectUnit = (unit: MeasurementUnit) => {
    setTempData({
      value: tempData.value,
      unit: unit,
    });
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSubmit = () => {
    setFormField('goal', tempData);
    router.back();
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const translatedUnit = translateMeasurementUnit(
    t,
    tempData.unit.id,
    tempData.unit
  );
  const goalText =
    tempData.value === 1 ? translatedUnit.oneName : translatedUnit.name;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardOffset(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOffset(0)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [insets.bottom]);
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
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={[styles.item]}
            onPress={handlePresentModalPress}
          >
            <MaterialIcons
              name="layers"
              size={24}
              color={colors.habitColors.salmonRed}
            />
            <Text style={styles.itemText}>{t('habits.unitLabel')}</Text>
            <View style={[styles.itemRight]}>
              <Text style={styles.itemUnit}>{translatedUnit.name}</Text>
              <Icon
                source={require('@/assets/icons/chevron-right.png')}
                size={24}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom, bottom: keyboardOffset },
        ]}
      >
        <Button
          onPress={handleSubmit}
          label={t('common.done')}
          type="primary"
        />
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={styles.bottomModalContainer}
      >
        <BottomSheetView
          style={[
            styles.bottomSheetContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.mainContainer}>
            <View style={styles.subContainer}>
              {Object.values(MeasurementUnits).map((unit: MeasurementUnit) => {
                const translatedModalUnit = translateMeasurementUnit(
                  t,
                  unit.id,
                  unit
                );
                return (
                  <TouchableOpacity
                    key={unit.id}
                    style={styles.bottomSheetItem}
                    onPress={() => handleSelectUnit(unit)}
                  >
                    <Text
                      style={[
                        styles.unitOptionText,
                        tempData.unit.id === unit.id &&
                          styles.selectedUnitOptionText,
                      ]}
                    >
                      {translatedModalUnit.name}
                    </Text>
                    {tempData.unit.id === unit.id && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
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
  bottomModalContainer: {
    backgroundColor: colors.bgLight,
  },
  bottomSheetContent: {
    backgroundColor: colors.bgLight,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  unitOptionText: {
    fontSize: 14,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  selectedUnitOptionText: {
    fontFamily: fontWeights.semibold,
    color: colors.primary,
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
  bottomSheetItem: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 16.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
