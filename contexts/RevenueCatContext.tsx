// contexts/RevenueCatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import purchases, { 
  PurchasesOffering} from 'react-native-purchases';
import { initializeRevenuecat, checkSubscriptionStatus } from '../utils/revenuecat';

interface RevenueCatContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  currentOffering: PurchasesOffering | null;
  checkSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  

  useEffect(() => {
    const initialize = async () => {
      initializeRevenuecat();
      await checkSubscription();
      try {
        const offerings = await purchases.getOfferings();
        if (offerings.current) {
          setCurrentOffering(offerings.current);
        }
      } catch (error) {
        console.error('Error loading offerings:', error);
      }
      setIsLoading(false);
    };

    initialize();
  }, []);

  const checkSubscription = async () => {
    const hasSubscription = await checkSubscriptionStatus();
    setIsSubscribed(hasSubscription);
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await purchases.restorePurchases();
      setIsSubscribed(customerInfo.activeSubscriptions.length > 0);
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{
        isSubscribed,
        isLoading,
        currentOffering,
        checkSubscription,
        restorePurchases,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};