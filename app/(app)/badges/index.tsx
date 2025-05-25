import Badges from '@/components/achievements/Badges';
import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { router } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const handleClose = () => {
    router.back();
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerSpacing} />

        <Text style={styles.heading}>Milestones</Text>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={ACTIVE_OPACITY}
          style={styles.closeButton}
        >
          <Icon
            source={require('@/assets/icons/x-close.png')}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainerStyle,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Badges />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  heading: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    textAlign: 'center',
    color: colors.text,
  },
});
