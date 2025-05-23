import { useMatrix } from '@/lib/hooks/useMatrix';
import React, { memo, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MatrixGridCell } from './MatrixGridCell';

interface MatrixGridProps {
  columnCount?: number;
}

export const MatrixGrid = memo(function MatrixGrid({
  columnCount = 2,
}: MatrixGridProps) {
  const renderCount = useRef(0);
  const { categories, balanceCategory } = useMatrix();

  // Render grid cells in rows based on columnCount
  const renderGrid = useMemo(() => {
    const gridStartTime = Date.now();
    renderCount.current++;

    // Ensure we have enough categories
    if (!categories || categories.length < 5) return null;

    const allCategories = [...categories.slice(0, 5), balanceCategory];
    const rows = [];

    // Create rows based on columnCount
    for (let i = 0; i < allCategories.length; i += columnCount) {
      const rowItems = allCategories.slice(i, i + columnCount);

      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((category, index) => (
            <View
              key={category.id || `category-${i + index}`}
              style={[styles.gridItem, { flex: 1 }]}
            >
              <MatrixGridCell category={category} />
            </View>
          ))}
        </View>
      );
    }

    return <>{rows}</>;
  }, [categories, balanceCategory, columnCount]);

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>{renderGrid}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gridContainer: {
    flex: 1,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridItem: {},
});
