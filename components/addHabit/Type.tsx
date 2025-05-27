import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon, RadioButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

type TypeFormData = {
  type: 'GOOD' | 'BAD';
};

export default function TypeChoosing({
  formData,
  setFormField,
}: {
  formData: TypeFormData;
  setFormField: <K extends keyof TypeFormData>(
    field: K,
    value: TypeFormData[K]
  ) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const selectedType = formData.type;

  const [tempType, setTempType] = useState<'GOOD' | 'BAD'>(selectedType);
  const handleTypeSelect = (type: 'GOOD' | 'BAD') => {
    setTempType(type);
  };
  const handleSubmit = () => {
    setFormField('type', tempType);
    router.back();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t('habits.selectHabitType')}</Text>
      </View>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={styles.itemContainer}
          onPress={() => handleTypeSelect('GOOD')}
        >
          <MaterialIcons
            name="check-circle"
            size={24}
            color={colors.habitColors.meadowGreen}
          />
          <Text style={styles.itemText}>{t('habits.good')}</Text>
          <View style={styles.radioButtonContainer}>
            <RadioButton
              value={tempType}
              status={tempType === 'GOOD' ? 'checked' : 'unchecked'}
              color={colors.primary}
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
          <Text style={styles.itemText}>{t('habits.bad')}</Text>
          <View style={styles.radioButtonContainer}>
            <RadioButton
              value={tempType}
              status={tempType === 'BAD' ? 'checked' : 'unchecked'}
              color={colors.primary}
              onPress={() => handleTypeSelect('BAD')}
            />
          </View>
        </TouchableOpacity>
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
  typeContainer: {
    paddingTop: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    ...colors.dropShadow,
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
