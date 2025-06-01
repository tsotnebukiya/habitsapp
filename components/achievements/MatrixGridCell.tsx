import { colors, fontWeights } from '@/lib/constants/ui';
import { MatrixCategory } from '@/lib/hooks/useMatrix';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { SFSymbol, SymbolView } from 'expo-symbols';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MatrixGridCellProps {
  category: MatrixCategory;
}

export const MatrixGridCell = memo(function MatrixGridCell({
  category,
}: MatrixGridCellProps) {
  const { t } = useTranslation();

  const getDifferenceColor = (difference: number) => {
    return difference >= 0 ? colors.primary : '#D92D20';
  };

  const getDifferenceText = (difference: number) => {
    const sign = difference >= 0 ? '+' : '';
    return `${sign}${difference}`;
  };

  // Get translated category name and description
  const getCategoryName = () => {
    if (category.id === 'total') {
      return t('categories.total' as any);
    }
    return t(`categories.${category.id}` as any);
  };

  const getCategoryDescription = () => {
    if (category.id === 'total') {
      return t('categoryDescriptions.total' as any);
    }
    return t(`categoryDescriptions.${category.id}` as any);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: category.display.background },
      ]}
    >
      <View style={styles.header}>
        {category.id === 'total' ? (
          <SymbolView
            name="circle.grid.cross.fill"
            size={24}
            tintColor={category.display.title}
          />
        ) : (
          <SymbolView
            name={category.icon as SFSymbol}
            size={24}
            tintColor={category.display.title}
          />
        )}
        <Text style={[styles.title, { color: category.display.title }]}>
          {getCategoryName()}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.numberContainer}>
          <Text style={[styles.score, { color: category.display.number }]}>
            {category.score}
          </Text>

          {category.difference !== 0 && (
            <Text
              style={[
                styles.difference,
                { color: getDifferenceColor(category.difference) },
              ]}
            >
              {getDifferenceText(category.difference)}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {getCategoryDescription()}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    ...colors.dropShadow,
    height: 174,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
  },
  scoreContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  numberContainer: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  score: {
    fontSize: 34,
    fontFamily: fontWeights.bold,
    textAlign: 'center',
  },
  difference: {
    fontSize: 17,
    fontFamily: fontWeights.bold,
    top: 8,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: fontWeights.regular,
    maxWidth: '80%',
  },
});
