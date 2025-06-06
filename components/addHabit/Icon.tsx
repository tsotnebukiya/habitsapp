/* IconChoosing.tsx – figma-accurate grid  (8 columns, 24 px glyph, 24 px gaps) */
import { useTranslation } from '@/lib/hooks/useTranslation';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ACTIVE_OPACITY } from '@/components/shared/config';
import ItemIcon from '@/components/shared/Icon';
import SearchInput from '@/components/shared/SearchInput';
import {
  EXTRA_EMOJIS,
  HABIT_SYMBOLS,
  PRIME_EMOJIS,
} from '@/lib/constants/icons';
import { colors } from '@/lib/constants/ui';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

/* ──────────── layout constants ──────────── */
const NUM_COLUMNS = 8; // 8 icons per row
const GAP = 24; // figma: 24-px space between icons
const SIDE_MARGIN = GAP / 2; // 12 px on each side → 24 px total gap

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE =
  (SCREEN_WIDTH - NUM_COLUMNS * GAP - GAP) /* outer padding */ / NUM_COLUMNS;

type IconFormData = {
  icon: string;
};

export default function IconChoosing({
  formData,
  setFormField,
}: {
  formData: IconFormData;
  setFormField: <K extends keyof IconFormData>(
    field: K,
    value: IconFormData[K]
  ) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const selectedIcon = formData.icon || 'lightbulb';
  const [tempIcon, setTempIcon] = useState<string>(selectedIcon);
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);
  const [query, setQuery] = useState('');

  /* derive filtered dataset */
  const data = useMemo(() => {
    const all =
      tabIndex === 0 ? HABIT_SYMBOLS : [...PRIME_EMOJIS, ...EXTRA_EMOJIS];

    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((item) => item.toString().toLowerCase().includes(q));
  }, [tabIndex, query]);

  /* tap handler */
  const handleSelect = useCallback(
    (value: string) => {
      setTempIcon(value);
    },
    [setFormField]
  );

  const handleSubmit = () => {
    setFormField('icon', tempIcon);
    router.back();
  };
  /* item renderer */
  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={ACTIVE_OPACITY}
        style={[styles.cell]}
      >
        <ItemIcon
          icon={item}
          color={item === tempIcon ? colors.primary : colors.text}
        />
      </TouchableOpacity>
    ),
    [tabIndex, selectedIcon, handleSelect, tempIcon]
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <SearchInput searchQuery={query} setSearchQuery={setQuery} />
      <SegmentedControl
        values={[t('habits.icons'), t('habits.emojis')]}
        selectedIndex={tabIndex}
        onChange={(e) =>
          setTabIndex(e.nativeEvent.selectedSegmentIndex as 0 | 1)
        }
        style={styles.segmentedControl}
      />
    </View>
  );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>{t('habits.selectIcon')}</Text>
      </View>
      <FlashList
        data={data}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        extraData={tempIcon}
        numColumns={NUM_COLUMNS}
        estimatedItemSize={CELL_SIZE + GAP} // height ≈ glyph + top/bottom gap
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{
          ...styles.content,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          onPress={handleSubmit}
          label={t('common.done')}
          type="primary"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* ──────────── styles ──────────── */
const styles = StyleSheet.create({
  container: sharedStyles.container,
  header: sharedStyles.header,
  heading: sharedStyles.heading,
  footer: sharedStyles.footer,
  root: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
  },
  listHeader: {
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
