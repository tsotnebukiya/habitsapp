import { colors, fontWeights } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

export default function TextChoosing({
  type,
}: {
  type: 'name' | 'description';
}) {
  const insets = useSafeAreaInsets();
  const formData = useAddHabitStore((state) => state.formData);
  const setFormField = useAddHabitStore((state) => state.setFormField);
  const [tempData, setTempData] = useState<string>(
    type === 'name' ? formData.name : formData.description
  );
  const handleSubmit = () => {
    setFormField(type === 'name' ? 'name' : 'description', tempData);
    router.back();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          {type === 'name' ? 'Habit name' : 'Description'}
        </Text>
      </View>
      <View style={styles.textContainer}>
        <TextInput
          style={styles.searchInput}
          mode="outlined"
          placeholder={type === 'name' ? 'Habit name' : 'Description'}
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
