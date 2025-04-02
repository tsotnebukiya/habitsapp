// app/onboarding/PaymentPlansModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import Toast from 'react-native-toast-message';
import Colors from '../../constants/Colors';
import purchases from 'react-native-purchases';
import { useRevenueCat } from '../../contexts/RevenueCatContext';

interface PaymentPlansModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PaymentPlansModal: React.FC<PaymentPlansModalProps> = ({ 
    visible, 
    onClose,
    onSuccess 
  }) => {
    const { currentOffering, isLoading: isLoadingSubscription } = useRevenueCat();
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
  
    const handlePurchase = async (pkg: PurchasesPackage) => {
      setIsPurchasing(true);
      try {
        await purchases.purchasePackage(pkg);
        Toast.show({
          type: 'success',
          text1: 'Thank you for subscribing!',
        });
        onSuccess?.();
        onClose();
      } catch (error: any) {
        if (!error.userCancelled) {
          Toast.show({
            type: 'error',
            text1: 'Purchase failed',
            text2: 'Please try again.',
          });
        }
      } finally {
        setIsPurchasing(false);
      }
    };
  
    const handleRestore = async () => {
      try {
        await purchases.restorePurchases();
        Toast.show({
          type: 'success',
          text1: 'Purchases restored successfully!',
        });
        onSuccess?.();
        onClose();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Restore failed',
          text2: 'Please try again.',
        });
      }
    };

  if (!currentOffering && !isLoadingSubscription) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load subscription options</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color={Colors.shared.neutral[600]} />
            </TouchableOpacity>
          </View>

          {isLoadingSubscription ? (
            <ActivityIndicator size="large" color={Colors.shared.primary[500]} />
          ) : (
            <>
              {currentOffering?.availablePackages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    selectedPackage?.identifier === pkg.identifier && styles.selectedPackage
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={isPurchasing}
                >
                  <View>
                    <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                    <Text style={styles.packageDescription}>
                      {pkg.product.description}
                    </Text>
                    <Text style={styles.packagePrice}>
                      {pkg.product.priceString}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={handleRestore}
                style={styles.restoreButton}
                disabled={isPurchasing}
              >
                <Text style={styles.restoreButtonText}>
                  Restore Purchases
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.light.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text.primary,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: Colors.light.border.default,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedPackage: {
    borderColor: Colors.shared.primary[500],
    backgroundColor: Colors.shared.primary[50],
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.shared.primary[500],
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: Colors.shared.primary[500],
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: Colors.light.text.primary,
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: Colors.shared.primary[500],
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentPlansModal;