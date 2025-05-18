import { colors, fontWeights } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function TextChoosing({
  type,
}: {
  type: 'name' | 'description';
}) {
  const formData = useAddHabitStore((state) => state.formData);
  const setFormField = useAddHabitStore((state) => state.setFormField);
  return (
    <View style={styles.container}>
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
        value={type === 'name' ? formData.name : formData.description}
        onChangeText={
          type === 'name'
            ? (text) => setFormField('name', text)
            : (text) => setFormField('description', text)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
