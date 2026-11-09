import posthog, { type CaptureResult } from 'posthog-js';
import type { AnalyticsEventName } from '@/domain/analytics-event.model';

export const isPostHogClientEnabled = () => !!(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);

export const capture = (event: AnalyticsEventName, properties?: Record<string, string | number | boolean | null>) => {
  if (isPostHogClientEnabled()) {
    posthog.capture(event, properties);
  }
};

export const identifyPostHogUser = (distinctId: string, email: string, role: string, name: string | null) => {
  if (!isPostHogClientEnabled()) return;
  posthog.identify(distinctId, {
    email,
    role,
    name: name ?? '',
  });
};

export const resetPostHog = () => {
  if (!isPostHogClientEnabled()) return;
  posthog.reset();
};

// Microsoft's Outlook Safe Links scanner opens e-mailed links in a headless Chrome and
// rejects promises with this message. It does not come from app code.
const SAFE_LINKS_SCANNER_REJECTION = /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/;

export const dropScannerExceptions = (event: CaptureResult | null): CaptureResult | null => {
  if (event?.event !== '$exception') return event;
  const exceptions: { value?: unknown }[] = event.properties.$exception_list ?? [];
  const isScannerNoise = exceptions.some(
    (exception) => typeof exception.value === 'string' && SAFE_LINKS_SCANNER_REJECTION.test(exception.value),
  );
  return isScannerNoise ? null : event;
};
