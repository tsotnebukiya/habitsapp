/* IconChoosing.tsx – figma-accurate grid  (8 columns, 24 px glyph, 24 px gaps) */
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ACTIVE_OPACITY } from '@/components/shared/config';
import ItemIcon from '@/components/shared/Icon';
import SearchInput from '@/components/shared/SearchInput';
import {
  EXTRA_EMOJIS,
  EXTRA_ICON_NAMES,
  PRIME_EMOJIS,
  PRIME_ICON_NAMES,
} from '@/lib/constants/icons';
import { colors } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ──────────── layout constants ──────────── */
const NUM_COLUMNS = 8; // 8 icons per row
const GAP = 24; // figma: 24-px space between icons
const SIDE_MARGIN = GAP / 2; // 12 px on each side → 24 px total gap

/* cell width = (screenWidth - totalHorizontalGap) / columns */
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE =
  (SCREEN_WIDTH - NUM_COLUMNS * GAP - GAP) /* outer padding */ / NUM_COLUMNS;

export default function IconChoosing() {
  const insets = useSafeAreaInsets();
  /* 0 = Icons, 1 = Emojis */
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);
  const [query, setQuery] = useState('');
  const selectedIcon = useAddHabitStore((s) => s.formData.icon);
  const setFormField = useAddHabitStore((s) => s.setFormField);
  /* derive filtered dataset */
  const data = useMemo(() => {
    const all =
      tabIndex === 0
        ? [...PRIME_ICON_NAMES, ...EXTRA_ICON_NAMES]
        : [...PRIME_EMOJIS, ...EXTRA_EMOJIS];

    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((item) => item.toLowerCase().includes(q));
  }, [tabIndex, query]);

  /* tap handler */
  const handleSelect = useCallback(
    (value: string) => {
      setFormField('icon', value);
      router.back();
    },
    [setFormField]
  );

  /* item renderer */
  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={ACTIVE_OPACITY}
        style={[styles.cell, item === selectedIcon && styles.selected]}
      >
        <ItemIcon icon={item} color={colors.text} />
        {/* <Text>{item}</Text> */}
      </TouchableOpacity>
    ),
    [tabIndex, selectedIcon, handleSelect]
  );

  const ListHeader = (
    <View style={styles.header}>
      <SearchInput searchQuery={query} setSearchQuery={setQuery} />
      <SegmentedControl
        values={['Icons', 'Emojis']}
        selectedIndex={tabIndex}
        onChange={(e) =>
          setTabIndex(e.nativeEvent.selectedSegmentIndex as 0 | 1)
        }
        style={styles.segmentedControl}
      />
    </View>
  );

  return (
    <FlashList
      data={data}
      keyExtractor={(item) => item}
      renderItem={renderItem}
      extraData={selectedIcon}
      numColumns={NUM_COLUMNS}
      estimatedItemSize={CELL_SIZE + GAP} // height ≈ glyph + top/bottom gap
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{
        ...styles.content,
        paddingBottom: insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

/* ──────────── styles ──────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
  },
  header: {
    paddingBottom: 12,
  },
  segmentedControl: {
    marginTop: 16,
    height: 38,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    marginHorizontal: SIDE_MARGIN,
    marginVertical: SIDE_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  selected: {
    backgroundColor: colors.primary,
  },
});
