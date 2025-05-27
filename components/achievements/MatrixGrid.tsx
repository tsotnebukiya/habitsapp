import { colors, fontWeights } from '@/lib/constants/ui';
import { useMatrix } from '@/lib/hooks/useMatrix';
import { useTranslation } from '@/lib/hooks/useTranslation';
import React, { memo, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MatrixGridCell } from './MatrixGridCell';

interface MatrixGridProps {
  columnCount?: number;
}

export const MatrixGrid = memo(function MatrixGrid({
  columnCount = 2,
}: MatrixGridProps) {
  const { t } = useTranslation();
  const renderCount = useRef(0);
  const { categories, balanceCategory } = useMatrix();

  const renderGrid = useMemo(() => {
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
            <View key={index} style={[styles.gridItem, { flex: 1 }]}>
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
      <Text style={styles.title}>{t('achievements.lifeBalanceMatrix')}</Text>
      <Text style={styles.description}>
        {t('achievements.scoresAcrossAreas')}
      </Text>
      <View style={styles.gridContainer}>{renderGrid}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  gridContainer: {
    flex: 1,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: fontWeights.regular,
    color: colors.text,
    marginBottom: 27,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridItem: {},
});
