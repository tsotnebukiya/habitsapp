import Colors from '@/lib/constants/Colors';
import { ACTIVE_OPACITY } from '@/lib/constants/layouts';
import { fontWeights } from '@/lib/constants/Typography';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FrequencyChoosing() {
  const formData = useAddHabitStore((state) => state.formData);
  const setFormField = useAddHabitStore((state) => state.setFormField);

  // Toggle day of week for weekly frequency
  // const toggleDayOfWeek = (index: number) => {
  //   const days = formData.daysOfWeek.includes(index)
  //     ? formData.daysOfWeek.filter((d: number) => d !== index)
  //     : [...formData.daysOfWeek, index];
  //   setFormField('daysOfWeek', days);
  // };
  const toggleDayOfWeek = (dayIndex: number) => {
    const currentDays = [...formData.daysOfWeek];

    if (currentDays.includes(dayIndex)) {
      if (currentDays.length === 1) return;
      setFormField(
        'daysOfWeek',
        currentDays.filter((day) => day !== dayIndex)
      );
    } else {
      setFormField('daysOfWeek', [...currentDays, dayIndex].sort());
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.frequencyOptionsContainer}>
        <View style={styles.frequencyOptions}>
          {['daily', 'weekly'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.frequencyOption,
                formData.frequencyType === type && styles.selectedFrequency,
              ]}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() =>
                setFormField('frequencyType', type as 'daily' | 'weekly')
              }
            >
              <Text
                style={[
                  styles.frequencyText,
                  formData.frequencyType === type &&
                    styles.selectedFrequencyText,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {formData.frequencyType === 'weekly' && (
        <View style={styles.card}>
          <Text style={styles.label}>Days of Week</Text>
          <View style={styles.daysContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
              (day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    formData.daysOfWeek.includes(index) && styles.selectedDay,
                  ]}
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={() => toggleDayOfWeek(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      formData.daysOfWeek.includes(index) &&
                        styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  frequencyOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    ...Colors.dropShadow,
    marginBottom: 24,
    padding: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedFrequency: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  frequencyText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: fontWeights.regular,
  },
  selectedFrequencyText: {
    color: 'white',
    fontFamily: fontWeights.semibold,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    ...Colors.dropShadow,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: Colors.text,
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  dayText: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: Colors.text,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedDayText: {
    color: 'white',
    fontFamily: fontWeights.semibold,
  },
});
