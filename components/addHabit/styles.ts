import { colors, fontWeights } from '@/lib/constants/ui';
import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 24,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontFamily: fontWeights.interBold,
    fontSize: 20,
    textAlign: 'center',
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 21,
  },
});
