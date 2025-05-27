import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

type ColorFormData = {
  color: string;
};

export default function ColorChoosing({
  formData,
  setFormField,
}: {
  formData: ColorFormData;
  setFormField: <K extends keyof ColorFormData>(
    field: K,
    value: ColorFormData[K]
  ) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const selectedColor = formData.color || colors.habitColors.cyanBlue;
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
        <Text style={styles.heading}>{t('habits.selectColor')}</Text>
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
