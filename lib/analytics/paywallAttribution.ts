type PaywallAttributionContext = {
  placement: string;
  paywallVariantId?: string | null;
  entrypoint?: string | null;
  presentedAt: number;
};

let paywallAttributionContext: PaywallAttributionContext | null = null;

export function setPaywallAttributionContext(
  context: Omit<PaywallAttributionContext, 'presentedAt'> & {
    presentedAt?: number;
  }
) {
  paywallAttributionContext = {
    ...context,
    presentedAt: context.presentedAt ?? Date.now(),
  };
}

export function clearPaywallAttributionContext() {
  paywallAttributionContext = null;
}

export function consumePaywallAttributionProperties(
  conversionTime = Date.now()
) {
  if (!paywallAttributionContext) {
    return null;
  }

  const properties = {
    conversion_paywall_placement: paywallAttributionContext.placement,
    conversion_paywall_variant_id:
      paywallAttributionContext.paywallVariantId ?? null,
    conversion_entrypoint: paywallAttributionContext.entrypoint ?? null,
    seconds_since_paywall_presented: Math.max(
      0,
      Math.round(
        (conversionTime - paywallAttributionContext.presentedAt) / 1000
      )
    ),
  };

  clearPaywallAttributionContext();
  return properties;
}
