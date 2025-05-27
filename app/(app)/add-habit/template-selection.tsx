import { ACTIVE_OPACITY } from '@/components/shared/config';
import ItemIcon from '@/components/shared/Icon';
import SearchInput from '@/components/shared/SearchInput';
import { HABIT_TEMPLATES, HabitTemplate } from '@/lib/constants/HabitTemplates';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TemplateSelection() {
  const { t } = useTranslation();
  const formData = useAddHabitStore((state) => state.formData);
  const applyTemplate = useAddHabitStore((state) => state.applyTemplate);
  const insets = useSafeAreaInsets();
  const [state, setState] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const templates = HABIT_TEMPLATES.filter((template) => {
    const translatedName = t(template.nameKey as any) || template.name;
    const searchLower = searchQuery.trim().toLowerCase();
    return (
      template.category === formData.category &&
      template.type === (state === 0 ? 'GOOD' : 'BAD') &&
      (template.name.toLowerCase().includes(searchLower) ||
        translatedName.toLowerCase().includes(searchLower))
    );
  });

  const handleCreateCustomHabit = () => {
    router.push('/add-habit/create-habit');
  };

  const handleChooseTemplate = (template: HabitTemplate) => {
    applyTemplate({
      ...template,
      name: t(template.nameKey as any),
      description: t(template.descriptionKey as any),
    });
    router.push('/add-habit/create-habit');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollView,
        { paddingBottom: insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <SegmentedControl
          values={[t('habits.good'), t('habits.bad')]}
          selectedIndex={state}
          onChange={(event) => {
            setState(event.nativeEvent.selectedSegmentIndex);
          }}
          style={styles.segmentedControl}
          activeFontStyle={{}}
        />
        <TouchableOpacity
          style={styles.cusstomHabbit}
          activeOpacity={ACTIVE_OPACITY}
          onPress={handleCreateCustomHabit}
        >
          <Text style={styles.cusstomHabbitText}>
            {t('habits.createCustomHabit')}
          </Text>
        </TouchableOpacity>
        <View style={styles.templatesContainer}>
          {templates.map((template) => (
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              key={template.id}
              style={styles.template}
              onPress={() => {
                handleChooseTemplate(template);
              }}
            >
              <ItemIcon color={template.color} icon={template.icon} />
              <Text style={styles.templateName}>
                {t(template.nameKey as any) || template.name}
              </Text>
              <View style={styles.chevron}>
                <Icon
                  source={require('@/assets/icons/chevron-right.png')}
                  size={18}
                  color={colors.text}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingTop: 24,
    paddingHorizontal: 18,
  },
  container: {
    flex: 1,
  },

  segmentedControl: {
    marginBottom: 15,
    height: 38,
  },
  cusstomHabbit: {
    backgroundColor: colors.primaryFaded20,
    borderRadius: 16,
    padding: 16,
    minHeight: 52,
    marginBottom: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cusstomHabbitText: {
    fontSize: 13,
    fontFamily: fontWeights.bold,
    color: colors.primary,
  },
  templatesContainer: {
    backgroundColor: colors.border,
    gap: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  template: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 16.5,
    gap: 8.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
