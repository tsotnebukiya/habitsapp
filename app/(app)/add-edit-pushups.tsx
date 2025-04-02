// app/(app)/add-edit-pushups.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { usePushupStore } from '../../interfaces/pushup_store';
import Colors from '../../constants/Colors';
import { useAllPushupEntries, usePushupEntry } from '../../hooks/usePushups';

export default function AddEditPushups() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const addEntry = usePushupStore(state => state.addEntry);
  const updateEntry = usePushupStore(state => state.updateEntry);
  const existingEntry = usePushupEntry(id?.toString() ?? null);

  const [count, setCount] = useState(existingEntry ? String(existingEntry.count) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!count || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (existingEntry) {
        await updateEntry(existingEntry.id, parseInt(count));
      } else {
        await addEntry(parseInt(count));
      }
      router.back();
    } catch (error) {
      console.error('Error saving pushups:', error);
      // We could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <FontAwesome6 name="xmark" size={20} color={Colors.light.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingEntry ? 'Edit Pushups' : 'Add Pushups'}
        </Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          style={[styles.headerButton, !count && styles.headerButtonDisabled]}
          disabled={!count || isSubmitting}
        >
          <Text style={[
            styles.saveButtonText,
            !count && styles.saveButtonTextDisabled
          ]}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>How many pushups did you do?</Text>
        <TextInput
          style={styles.input}
          value={count}
          onChangeText={setCount}
          keyboardType="number-pad"
          placeholder="Enter number"
          placeholderTextColor={Colors.light.text.secondary}
          autoFocus={true}
          maxLength={4}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border.light,
    backgroundColor: Colors.light.background.paper,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.shared.primary[500],
  },
  saveButtonTextDisabled: {
    color: Colors.light.text.secondary,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text.primary,
    marginBottom: 12,
  },
  input: {
    fontSize: 32,
    padding: 16,
    backgroundColor: Colors.light.background.paper,
    borderRadius: 12,
    color: Colors.light.text.primary,
    textAlign: 'center',
    shadowColor: Colors.shared.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});