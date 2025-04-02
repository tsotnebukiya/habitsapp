// utils/revenuecat.ts
import purchases, { 
    PurchasesConfiguration,
    CustomerInfo,
    LOG_LEVEL,
    PurchasesError,
    PurchasesPackage,
    PurchasesOfferings
  } from 'react-native-purchases';
  import { Platform } from 'react-native';
  import { REVENUECAT_IOS_KEY, REVENUECAT_ANDROID_KEY } from '../safe_constants';
  
  export interface SubscriptionPackage {
    identifier: string;
    description: string;
    price: number;
    period: string;
    title: string;
  }
  
  export const initializeRevenuecat = () => {
    const configuration: PurchasesConfiguration = {
      apiKey: Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY
    };
    
    purchases.configure(configuration);
  
    if (__DEV__) {
      purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
  };
  
  export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
    try {
      const offerings = await purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  };
  
  export const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo> => {
    try {
      const { customerInfo } = await purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error: any) {
      if (!(error.userCancelled)) {
        console.error('Error purchasing package:', error);
      }
      throw error;
    }
  };
  
  export const restorePurchases = async (): Promise<CustomerInfo> => {
    try {
      const customerInfo = await purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  };
  
  export const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
      const customerInfo = await purchases.getCustomerInfo();
      return customerInfo.activeSubscriptions.length > 0;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  };