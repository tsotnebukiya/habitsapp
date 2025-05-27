import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

type TextFormData = {
  name: string;
  description: string;
};

export default function TextChoosing({
  formData,
  setFormField,
  type,
}: {
  formData: TextFormData;
  setFormField: <K extends keyof TextFormData>(
    field: K,
    value: TextFormData[K]
  ) => void;
  type: 'name' | 'description';
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [tempData, setTempData] = useState<string>(
    type === 'name' ? formData.name || '' : formData.description || ''
  );
  const handleSubmit = () => {
    setFormField(type === 'name' ? 'name' : 'description', tempData);
    router.back();
  };
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
        <Text style={styles.heading}>
          {type === 'name' ? t('habits.habitName') : t('habits.description')}
        </Text>
      </View>
      <View style={styles.textContainer}>
        <TextInput
          style={styles.searchInput}
          mode="outlined"
          placeholder={
            type === 'name' ? t('habits.habitName') : t('habits.description')
          }
          outlineStyle={[
            styles.searchOutline,
            type === 'description' && styles.multiline,
          ]}
          multiline={type === 'description'}
          numberOfLines={type === 'description' ? 4 : 1}
          value={tempData}
          onChangeText={
            type === 'name'
              ? (text) => setTempData(text)
              : (text) => setTempData(text)
          }
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.container,
  header: sharedStyles.header,
  heading: sharedStyles.heading,
  footer: sharedStyles.footer,
  textContainer: {
    paddingTop: 24,
  },
  searchInput: {
    borderRadius: 16,
    backgroundColor: 'white',
    fontSize: 13,
    fontFamily: fontWeights.regular,
    color: colors.text,
  },
  multiline: {
    height: 170,
  },
  searchOutline: {
    borderRadius: 16,
    borderColor: 'white',
    ...colors.dropShadow,
  },
});
