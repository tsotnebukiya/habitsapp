import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useAddHabitStore } from '@/lib/interfaces/add_habit_store';
import { HABIT_TEMPLATES } from '@/lib/constants/HabitTemplates';
import { Ionicons } from '@expo/vector-icons';

export default function TemplateSelection() {
  const { formData, setCurrentStep, applyTemplate } = useAddHabitStore();

  // Filter templates by selected category
  const templates = HABIT_TEMPLATES.filter(
    (template) => template.category === formData.category
  );

  const handleBack = () => {
    setCurrentStep('category');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a Template</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.templatesContainer}>
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[styles.templateCard, { borderLeftColor: template.color }]}
            onPress={() => applyTemplate(template)}
          >
            <View style={styles.templateIconContainer}>
              <Text style={styles.templateIcon}>{template.icon}</Text>
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription} numberOfLines={2}>
                {template.description}
              </Text>
              {template.goalType !== 'completion' &&
                template.defaultGoalValue && (
                  <Text style={styles.templateGoal}>
                    Goal: {template.defaultGoalValue}
                    {template.defaultGoalUnit
                      ? ' ' + template.defaultGoalUnit
                      : ''}
                  </Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}></View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  templatesContainer: {
    flex: 1,
    padding: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  templateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateIcon: {
    fontSize: 20,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateGoal: {
    fontSize: 12,
    color: '#007AFF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  customButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '100%',
    alignItems: 'center',
  },
  customButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
