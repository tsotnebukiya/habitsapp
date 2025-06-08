import Superwall, {
  PurchaseController,
  SubscriptionStatus,
} from '@superwall/react-native-superwall';
import { useCallback, useEffect, useState } from 'react';

// Conditional return type for useSubscriptionStatus based on whether a PurchaseController is provided
type UseSubscriptionStatusReturn<P extends PurchaseController | undefined> =
  P extends PurchaseController
    ? {
        subscriptionStatus: SubscriptionStatus;
        setSubscriptionStatus: (status: SubscriptionStatus) => Promise<void>;
      }
    : { subscriptionStatus: SubscriptionStatus };

/**
 * Hook to track and manage subscription status changes.
 *
 * This hook subscribes to subscription status updates from Superwall. Depending on whether
 * a PurchaseController is provided, it returns an object with a getter and a setter.
 *
 * - When the PurchaseController is used, the returned
 *   object includes:
 *   • `subscriptionStatus`: The current subscription state.
 *   • `setSubscriptionStatus`: A function to update the subscription status.
 *
 * - When a PurchaseController is not used, the hook returns an object that still includes both
 *   properties but `setSubscriptionStatus` is an error-throwing closure that will throw an error if used.
 *   This explicit error advises that subscription status changes should be handled by Superwall,
 *   and prevents accidental misuse.
 *
 * @example
 * // Write-enabled (with a PurchaseController):
 * const { subscriptionStatus, setSubscriptionStatus } = useSubscriptionStatus();
 *
 * // Read-only (without a PurchaseController):
 * // Note: Although "setSubscriptionStatus" is present, calling it will throw an error.
 * const { subscriptionStatus, setSubscriptionStatus } = useSubscriptionStatus();
 */
export function useSubscriptionStatus() {
  // Forward the purchase controller to the internal hook
  return useSubscriptionStatusInternal(Superwall.purchaseController);
}

function useSubscriptionStatusInternal<
  P extends PurchaseController | undefined = undefined
>(purchaseController?: P): UseSubscriptionStatusReturn<P> {
  const effectivePurchaseController =
    purchaseController ?? Superwall.purchaseController;

  const [subscriptionStatus, setSubscriptionStatusState] =
    useState<SubscriptionStatus>({
      status: 'UNKNOWN',
    });

  useEffect(() => {
    const listener = (status: SubscriptionStatus) => {
      setSubscriptionStatusState(status);
    };

    // Fetch initial subscription status
    const fetchInitialStatus = async () => {
      try {
        const initialStatus = await Superwall.shared.getSubscriptionStatus();
        setSubscriptionStatusState(initialStatus);
      } catch (error) {
        console.error('Failed to fetch initial subscription status:', error);
      }
    };

    fetchInitialStatus();
    Superwall.shared.subscriptionStatusEmitter.addListener('change', listener);

    // Cleanup function to remove listener
    return () => {
      Superwall.shared.subscriptionStatusEmitter.removeListener(
        'change',
        listener
      );
    };
  }, []);

  const setSubscriptionStatus = useCallback(
    async (status: SubscriptionStatus) => {
      await Superwall.shared.setSubscriptionStatus(status);
    },
    []
  );

  if (effectivePurchaseController != null) {
    return {
      subscriptionStatus,
      setSubscriptionStatus,
    } as UseSubscriptionStatusReturn<P>;
  } else {
    return {
      subscriptionStatus,
      setSubscriptionStatus: () => {
        throw new Error(
          '[Superwall] setSubscriptionStatus is not available when a PurchaseController is not provided. Superwall will manage subscription status automatically.'
        );
      },
    } as UseSubscriptionStatusReturn<P>;
  }
}
