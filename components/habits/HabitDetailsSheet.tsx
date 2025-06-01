import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { Habit } from '@/lib/habit-store/types';
import { useHabitStatusInfo } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as DropdownMenu from 'zeego/dropdown-menu';
import Button from '../shared/Button';
import { ACTIVE_OPACITY } from '../shared/config';

interface HabitDetailsSheetProps {
  habit: Habit | null;
  date: Date;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  onDismiss: () => void;
}

export default function HabitDetailsSheet({
  habit,
  date,
  bottomSheetModalRef,
  onDismiss,
}: HabitDetailsSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);

  const toggleHabitStatus = useHabitsStore((state) => state.toggleHabitStatus);
  const deleteHabit = useHabitsStore((state) => state.deleteHabit);
  const { completion, currentValue, progress } = useHabitStatusInfo(
    habit?.id!,
    date
  );
  const resetHabitHistory = useHabitsStore((state) => state.resetHabitHistory);

  const currentCompletion = completion;
  const isSkipped = currentCompletion?.status === 'skipped';
  const isCompleted = currentCompletion?.status === 'completed';
  const maxValue = habit?.goal_value || habit?.completions_per_day || 1;
  const stepSize = habit?.goal_value ? Math.max(habit.goal_value * 0.1, 1) : 1;

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const showIsSkippedToast = () => {
    Toast.show({
      type: 'error',
      text1: t('habits.cannotCompleteSkipped'),
      text2: t('habits.unskipFirst'),
      position: 'bottom',
    });
  };

  const handleDelete = () => {
    if (!habit) return;
    deleteHabit(habit.id);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleEdit = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Will be expanded with edit functionality later
  };

  const handleSkip = () => {
    if (!habit) return;
    toggleHabitStatus(habit.id, date, 'toggle_skip');
  };

  const handleCompletion = () => {
    if (!habit) return;
    if (isSkipped) {
      showIsSkippedToast();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleHabitStatus(habit.id, date, 'toggle_complete');
  };

  const handleIncrement = () => {
    if (!habit) return;
    if (isSkipped) {
      showIsSkippedToast();
      return;
    }
    if (currentValue < maxValue) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleHabitStatus(habit.id, date, 'set_value', currentValue + stepSize);
    }
  };

  const handleDecrement = () => {
    if (!habit || isSkipped) return;
    if (currentValue > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleHabitStatus(habit.id, date, 'set_value', currentValue - stepSize);
    }
  };

  const handleResetHistory = () => {
    if (!habit) return;
    resetHabitHistory(habit.id);
  };

  const handleProgressContainerPress = () => {
    if (!habit || isSkipped) return;
    setInputValue(currentValue.toString());
    setShowInputModal(true);
  };

  const handleSetValue = () => {
    if (!habit) return;
    const numValue = parseInt(inputValue, 10);

    if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
      Alert.alert(
        t('common.invalidValue'),
        t('common.valueMustBeBetween', { min: 0, max: maxValue })
      );
      return;
    }

    toggleHabitStatus(habit.id, date, 'set_value', numValue);
    setShowInputModal(false);
    setInputValue('');
  };

  const handleInputChange = (text: string) => {
    // Only allow integers (no decimals, no negative signs)
    const filteredText = text.replace(/[^0-9]/g, '');
    setInputValue(filteredText);
  };

  const handleCancelInput = () => {
    setShowInputModal(false);
    setInputValue('');
  };

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [currentValue]);

  if (!habit) return null;

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      ref={bottomSheetModalRef}
      backgroundStyle={styles.modalStyle}
      enableDynamicSizing={true}
      onDismiss={onDismiss}
    >
      <BottomSheetView>
        <View style={[styles.container, { paddingBottom: insets.bottom + 7 }]}>
          <View style={styles.header}>
            <View style={styles.emptyView} />
            <Text style={styles.habitName}>{habit.name}</Text>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  icon="dots-horizontal"
                  mode="contained"
                  style={styles.iconButton}
                  iconColor="black"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Label />
                <DropdownMenu.Item key="edit" onSelect={handleEdit}>
                  <DropdownMenu.ItemTitle>
                    {t('common.edit')}
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon ios={{ name: 'pencil.line' }} />
                </DropdownMenu.Item>

                {!isSkipped && (
                  <DropdownMenu.Item key="skip" onSelect={handleSkip}>
                    <DropdownMenu.ItemTitle>
                      {t('common.skip')}
                    </DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIcon
                      ios={{ name: 'arrow.forward.to.line' }}
                    />
                  </DropdownMenu.Item>
                )}
                {isSkipped && (
                  <DropdownMenu.Item key="unskip" onSelect={handleSkip}>
                    <DropdownMenu.ItemTitle>
                      {t('habits.unskip')}
                    </DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIcon
                      ios={{ name: 'arrow.backward.to.line' }}
                    />
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Item key="reset" onSelect={handleResetHistory}>
                  <DropdownMenu.ItemTitle>
                    {t('habits.resetHistory')}
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon ios={{ name: 'repeat' }} />
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  key="delete"
                  destructive
                  onSelect={handleDelete}
                >
                  <DropdownMenu.ItemTitle>
                    {t('habits.deleteHabit')}
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon ios={{ name: 'trash' }} />
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </View>

          <View style={styles.counterContainer}>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              onPress={handleDecrement}
              style={[
                styles.button,
                currentValue <= 0 && styles.buttonDisabled,
              ]}
              disabled={currentValue <= 0 || isSkipped}
            >
              <MaterialIcons name="remove" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              onPress={handleProgressContainerPress}
              style={[styles.progressContainer, isSkipped && styles.disabled]}
              disabled={isSkipped}
            >
              <View
                style={[
                  styles.baseProgress,
                  { backgroundColor: '#5BADFF', opacity: 0.38 },
                ]}
              />
              <View style={styles.progressWrapper}>
                <View
                  style={[
                    styles.completedProgress,
                    {
                      backgroundColor: '#5BADFF',
                      width: `${progress * 100}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{currentValue}</Text>
                <Text style={styles.maxValue}>/{maxValue}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              onPress={handleIncrement}
              style={[
                styles.button,
                currentValue >= maxValue && styles.buttonDisabled,
              ]}
              disabled={currentValue >= maxValue}
            >
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              type="secondary"
              disabled={progress === 0}
              onPress={handleCompletion}
              fullWidth={false}
              icon={
                <Icon
                  source={require('@/assets/icons/flip-backward.png')}
                  size={24}
                />
              }
            />
            <Button
              disabled={isCompleted}
              label={t('habits.complete')}
              type="primary"
              onPress={handleCompletion}
            />
          </View>
        </View>
      </BottomSheetView>

      {/* Input Modal */}
      <Modal
        visible={showInputModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelInput}
      >
        <BlurView
          intensity={5}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={handleCancelInput}
            android_disableSound
          />

          <View style={styles.inputModal}>
            <Text style={styles.inputModalTitle}>{t('habits.setValue')}</Text>

            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={handleInputChange}
              keyboardType="number-pad"
              placeholder={`0 - ${maxValue}`}
              autoFocus
              selectTextOnFocus
              maxLength={maxValue.toString().length}
            />

            <View style={styles.inputModalButtons}>
              <Button
                label={t('common.cancel')}
                type="secondary"
                onPress={handleCancelInput}
              />
              <Button
                label={t('common.confirm')}
                type="primary"
                onPress={handleSetValue}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalStyle: { backgroundColor: '#F9F9F9', borderRadius: 10 },
  container: {
    height: '100%',
    paddingHorizontal: 20,
    gap: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    backgroundColor: 'white',
    width: 34,
    height: 34,
  },
  emptyView: {
    width: 34,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontFamily: fontWeights.bold,
    color: colors.text,
  },
  counterContainer: {
    alignItems: 'center',
    gap: 19,
    flexDirection: 'row',
  },
  progressContainer: {
    position: 'relative',
    flex: 1,
    height: 172,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  baseProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  progressWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  completedProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  counterContent: {},
  button: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  value: {
    fontSize: 63,
    fontFamily: fontWeights.semibold,
    color: colors.bgLight,
  },
  maxValue: {
    fontSize: 33,
    fontFamily: fontWeights.semibold,
    color: colors.bgLight,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '30%',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inputModal: {
    width: '90%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.bgLight,
    gap: 16,
  },
  inputModalTitle: {
    fontSize: 20,
    fontFamily: fontWeights.interBold,
    color: colors.text,
    textAlign: 'center',
  },
  textInput: {
    fontSize: 18,
    fontFamily: fontWeights.medium,
    color: colors.text,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  inputModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
