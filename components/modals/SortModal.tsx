import { colors } from '@/lib/constants/ui';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ACTIVE_OPACITY } from '../shared/config';

interface Props {
  onDismiss: () => void;
}

const SortModal = ({ onDismiss }: Props) => {
  const handleConfirm = () => {
    onDismiss();
  };

  const handleCancel = () => {
    onDismiss();
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <BlurView intensity={5} style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onDismiss}>
          <View style={styles.container}>
            <View style={styles.buttons}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 12,
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  confirmButton: {
    padding: 12,
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },

  cancelText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  confirmText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default SortModal;
