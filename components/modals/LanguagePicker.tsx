import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/utils/i18n';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.9;

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const LanguagePickerModal = ({ visible, onDismiss }: Props) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>(currentLanguage);

  const handleSave = async () => {
    if (selectedLanguage !== currentLanguage) {
      await changeLanguage(selectedLanguage);
    }
    onDismiss();
  };

  const handleCancel = () => {
    setSelectedLanguage(currentLanguage); // Reset to current language
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Pressable style={[styles.modalContainer, { width: MODAL_WIDTH }]}>
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.1}
              style={styles.closeButton}
            >
              <Icon
                source={require('@/assets/icons/x-close.png')}
                size={24}
                color="black"
              />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>{t('settings.language')}</Text>
              <Text style={styles.subtitleText}>
                {t('settings.selectLanguage')}
              </Text>
            </View>

            {/* Language Picker */}
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedLanguage}
                  onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <Picker.Item key={code} label={name} value={code} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.bgLight,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 24,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: colors.textLight,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...colors.dropShadow,
  },
  pickerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  pickerWrapper: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 200,
    width: '100%',
  },
  pickerItem: {
    fontSize: 18,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fontWeights.medium,
    color: 'white',
  },
});

export default LanguagePickerModal;
