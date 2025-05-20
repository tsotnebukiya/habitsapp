import { useModalStore } from '@/lib/stores/modal_store';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ACTIVE_OPACITY } from '../shared/config';

interface Props {
  onDismiss: () => void;
}

const ConfirmationModal = ({ onDismiss }: Props) => {
  const { confirmationData } = useModalStore();

  const handleConfirm = () => {
    if (confirmationData.onConfirm) {
      confirmationData.onConfirm();
    }
    onDismiss();
  };

  const handleCancel = () => {
    if (confirmationData.onCancel) {
      confirmationData.onCancel();
    }
    onDismiss();
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {confirmationData.title && (
            <Text style={styles.title}>{confirmationData.title}</Text>
          )}
          <Text style={styles.message}>{confirmationData.message}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={ACTIVE_OPACITY}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={ACTIVE_OPACITY}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    borderRadius: 12,
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
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  confirmButton: {
    padding: 12,
    flex: 1,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '500',
  },
  confirmText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ConfirmationModal;
