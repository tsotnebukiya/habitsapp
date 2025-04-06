import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { MeasurementUnits } from '../../../lib/constants/MeasurementUnits';
import Colors from '../../../lib/constants/Colors';
import { NumericInput } from '../../../components/shared/NumericInput';
import { useAddHabitStore } from '../../../lib/interfaces/add_habit_store';

export default function GoalChoosing() {
  const router = useRouter();
  const { formData, setFormField } = useAddHabitStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Goal</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.saveButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.sectionTitle}>Goal Value</Text>
        <NumericInput
          value={formData.goal.value}
          onChange={(value) =>
            setFormField('goal', { ...formData.goal, value })
          }
          increment={formData.goal.unit.baseIncrement}
          unit={formData.goal.unit.shortName}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Measurement Type
        </Text>
        <View style={styles.unitList}>
          {Object.values(MeasurementUnits).map((unit) => (
            <TouchableOpacity
              key={unit.id}
              style={[
                styles.unitItem,
                unit.id === formData.goal.unit.id && styles.selectedUnit,
              ]}
              onPress={() => {
                setFormField('goal', {
                  value: unit.defaultGoal,
                  unit,
                });
              }}
            >
              <View style={styles.unitInfo}>
                <Text style={styles.unitName}>{unit.name}</Text>
                <Text style={styles.unitExample}>
                  Example: {unit.defaultGoal}
                  {unit.shortName}
                </Text>
              </View>
              {unit.id === formData.goal.unit.id && (
                <FontAwesome6
                  name="check"
                  size={16}
                  color={Colors.light.brand.primary[500]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  unitList: {
    marginTop: 8,
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.light.background.paper,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedUnit: {
    backgroundColor: Colors.light.brand.primary[50],
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text.primary,
    marginBottom: 4,
  },
  unitExample: {
    fontSize: 14,
    color: Colors.light.text.secondary,
  },
});
