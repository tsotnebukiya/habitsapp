import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useMatrix } from '@/lib/hooks/useMatrix';
import { MatrixGridCell } from './MatrixGridCell';

interface MatrixGridProps {
  columnCount?: number;
}

export const MatrixGrid = memo(function MatrixGrid({
  columnCount = 2,
}: MatrixGridProps) {
  const { categories, balanceCategory } = useMatrix();

  // Calculate cell width based on screen width and column count - only recalculate when dimensions change
  const cellWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return (screenWidth - 32) / columnCount; // 32 = total horizontal padding
  }, [columnCount]);

  // Render individual cells - only re-render when the data or cell width changes
  const renderRows = useMemo(() => {
    // Ensure we have enough categories
    if (!categories || categories.length < 5) return null;

    return (
      <>
        {/* First row - first two categories */}
        <View style={styles.row}>
          <View style={[styles.cell, { width: cellWidth }]}>
            <MatrixGridCell category={categories[0]} />
          </View>
          <View style={[styles.cell, { width: cellWidth }]}>
            <MatrixGridCell category={categories[1]} />
          </View>
        </View>

        {/* Second row - next two categories */}
        <View style={styles.row}>
          <View style={[styles.cell, { width: cellWidth }]}>
            <MatrixGridCell category={categories[2]} />
          </View>
          <View style={[styles.cell, { width: cellWidth }]}>
            <MatrixGridCell category={categories[3]} />
          </View>
        </View>

        {/* Third row - last category and balance */}
        <View style={styles.row}>
          <View style={[styles.cell, { width: cellWidth }]}>
            <MatrixGridCell category={categories[4]} />
          </View>
          <View style={[styles.cell, { width: cellWidth }]}>
            <MatrixGridCell category={balanceCategory} />
          </View>
        </View>
      </>
    );
  }, [categories, balanceCategory, cellWidth]);

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>{renderRows}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 8,
    width: '100%',
  },
  gridContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  cell: {
    padding: 0,
  },
});
