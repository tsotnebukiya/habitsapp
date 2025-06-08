import Button from '@/components/shared/Button';
import { colors, fontWeights } from '@/lib/constants/ui';
import { BlurView } from 'expo-blur';
import { SFSymbol, SymbolView } from 'expo-symbols';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const GatedBlurView = ({
  handlePurchase,
  buttonText,
  icon,
}: {
  handlePurchase: () => void;
  buttonText: string;
  icon: SFSymbol;
}) => {
  return (
    <>
      <BlurView
        intensity={15}
        style={StyleSheet.absoluteFill}
        pointerEvents="auto"
      >
        <View style={styles.paywallOverlay}>
          <View style={styles.purchaseButtonContainer}>
            <Button
              icon={<SymbolView name={icon} size={24} tintColor={'white'} />}
              type="primary"
              label={buttonText}
              onPress={handlePurchase}
            />
          </View>
        </View>
      </BlurView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight, // Slightly off-white background for contrast
  },
  contentContainerStyle: { paddingHorizontal: 18 },
  title: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 17,
  },
  paywallOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
  },
  purchaseButtonContainer: {
    height: 54,
    width: '70%',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default GatedBlurView;
