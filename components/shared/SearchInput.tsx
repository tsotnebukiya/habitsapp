import Colors from '@/lib/constants/Colors';
import { fontWeights } from '@/lib/constants/Typography';
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
  return (
    <TextInput
      style={styles.searchInput}
      mode="outlined"
      placeholder="Search"
      outlineStyle={styles.searchOutline}
      left={
        <TextInput.Icon
          icon={require('@/assets/icons/search-lg.png')}
          size={20}
          color={Colors.text}
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
    color: Colors.text,
    marginBottom: 18,
  },
  searchOutline: {
    borderRadius: 16,
    borderColor: 'white',
    ...Colors.dropShadow,
  },
});
