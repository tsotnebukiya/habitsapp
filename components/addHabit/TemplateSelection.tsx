import Colors from '@/lib/constants/Colors';
import { HABIT_TEMPLATES } from '@/lib/constants/HabitTemplates';
import { fontWeights } from '@/lib/constants/Typography';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import ItemIcon from '../shared/Icon';

export default function TemplateSelection() {
  const formData = useAddHabitStore((state) => state.formData);
  const [state, setState] = useState(0);
  const templates = HABIT_TEMPLATES.filter(
    (template) => template.category === formData.category
  );
  console.log(state);
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        mode="outlined"
        placeholder="Search"
        outlineStyle={styles.searchOutline}
        left={
          <TextInput.Icon
            icon={require('@/assets/icons/search-lg.png')}
            size={20}
            color={Colors.text}
            style={{ marginLeft: 12 }}
            rippleColor={'transparent'}
          />
        }
      />
      <SegmentedControl
        values={['Good', 'Bad']}
        selectedIndex={state}
        onChange={(event) => {
          setState(event.nativeEvent.selectedSegmentIndex);
        }}
        style={{
          height: 38,
        }}
        activeFontStyle={{}}
      />
      <ItemIcon color="red" icon="water-drop" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    borderRadius: 16,
    backgroundColor: 'white',
    fontSize: 13,
    fontFamily: fontWeights.regular,
    color: Colors.text,
    marginBottom: 18,
  },
  searchOutline: {
    borderRadius: 16,
    borderColor: 'white',
    ...Colors.dropShadow,
  },
});
