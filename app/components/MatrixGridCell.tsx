import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatrixCategory } from '@/lib/hooks/useMatrix';

interface MatrixGridCellProps {
  category: MatrixCategory;
  size?: 'small' | 'medium' | 'large';
}

export const MatrixGridCell = memo(function MatrixGridCell({
  category,
  size = 'medium',
}: MatrixGridCellProps) {
  // Create a solid background color by mixing with white
  // Instead of using opacity which causes shadow rendering issues
  const getBgColor = (color: string, opacity: number = 0.15) => {
    // Simple mixing function - assumes color is a hex value
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);

    // Mix with white (255,255,255) based on opacity
    const mixedR = Math.round(r * opacity + 255 * (1 - opacity));
    const mixedG = Math.round(g * opacity + 255 * (1 - opacity));
    const mixedB = Math.round(b * opacity + 255 * (1 - opacity));

    // Convert back to hex
    return `#${mixedR.toString(16).padStart(2, '0')}${mixedG
      .toString(16)
      .padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBgColor(category.color) }, // Solid background instead of opacity
        styles[size],
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={category.icon as any}
          size={24}
          color={category.color}
        />
        <Text style={[styles.title, { color: category.color }]}>
          {category.name}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: category.color }]}>
          {category.score}
        </Text>
        {category.description && (
          <Text style={styles.description} numberOfLines={2}>
            {category.description}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  small: {
    height: 120,
  },
  medium: {
    height: 150,
  },
  large: {
    height: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
});
