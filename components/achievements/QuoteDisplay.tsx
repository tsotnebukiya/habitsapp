import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy quote
const quote = {
  text: 'The journey of a thousand miles begins with a single step.',
  author: 'Lao Tzu',
};

export const QuoteDisplay = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <Text style={styles.authorText}>- {quote.author}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  authorText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
