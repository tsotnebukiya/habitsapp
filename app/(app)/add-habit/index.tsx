import CategorySelection from '@/components/addHabit/CategorySelection';
import CreateHabbit from '@/components/addHabit/CreateHabit';
import TemplateSelection from '@/components/addHabit/TemplateSelection';
import { ACTIVE_OPACITY } from '@/lib/constants/layouts';
import { fontWeights } from '@/lib/constants/Typography';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function AddHabit() {
  const resetForm = useAddHabitStore((state) => state.resetForm);
  const setCurrentStep = useAddHabitStore((state) => state.setCurrentStep);
  const currentStep = useAddHabitStore((state) => state.currentStep);
  const backButton = currentStep !== 'category';

  const handleClose = () => {
    router.back();
  };

  const handleBack = () => {
    if (currentStep === 'templates') {
      setCurrentStep('category');
    } else if (currentStep === 'main') {
      setCurrentStep('templates');
    }
  };

  const renderContent = () => {
    if (currentStep === 'category') {
      return <CategorySelection />;
    }

    if (currentStep === 'templates') {
      return <TemplateSelection />;
    }
    return <CreateHabbit />;
  };

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {backButton ? (
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={ACTIVE_OPACITY}
            style={styles.backButton}
          >
            <Icon
              source={require('@/assets/icons/chevron-left.png')}
              size={18}
              color="black"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacing} />
        )}

        <Text style={styles.heading}>Add New Habit</Text>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={ACTIVE_OPACITY}
          style={styles.closeButton}
        >
          <Icon
            source={require('@/assets/icons/x-close.png')}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  heading: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    textAlign: 'center',
    color: Colors.text,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
