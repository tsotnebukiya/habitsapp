type AnalyticsClient = {
  capture: (event: string, properties?: Record<string, any>) => void;
  flush: () => Promise<void>;
};

let analyticsClient: AnalyticsClient | null = null;

export function setAnalyticsClient(client: AnalyticsClient | null) {
  analyticsClient = client;
}

export function getAnalyticsClient() {
  return analyticsClient;
}

export function captureAnalyticsEvent(
  event: string,
  properties?: Record<string, any>
) {
  analyticsClient?.capture(event, properties);
}

export async function flushAnalyticsEvents() {
  if (!analyticsClient) {
    return;
  }

  await analyticsClient.flush();
}
