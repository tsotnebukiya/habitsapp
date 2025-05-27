import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

type SearchInputProps = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};
export default function SearchInput({
  searchQuery,
  setSearchQuery,
}: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <TextInput
      style={styles.searchInput}
      mode="outlined"
      placeholder={t('common.search')}
      outlineStyle={styles.searchOutline}
      left={
        <TextInput.Icon
          icon={require('@/assets/icons/search-lg.png')}
          size={20}
          color={colors.text}
          style={{ marginLeft: 12 }}
          rippleColor={'transparent'}
        />
      }
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderRadius: 16,
    backgroundColor: 'white',
    fontSize: 13,
    fontFamily: fontWeights.regular,
    color: colors.text,
    marginBottom: 18,
  },
  searchOutline: {
    borderRadius: 16,
    borderColor: 'white',
    ...colors.dropShadow,
  },
});
