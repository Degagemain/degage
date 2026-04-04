import { getRequestUserId } from '@/context/request-context';
import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export const isPostHogEnabled = !!(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);

export const getPostHogClient = (): PostHog => {
  if (!isPostHogEnabled) {
    throw new Error('PostHog is not enabled');
  }
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
};

/**
 * Capture an event, if posthog is enabled.
 * @param event The event to capture.
 * @param properties The properties to capture.
 */
export const captureEvent = (
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, string | number | any>,
) => {
  if (!isPostHogEnabled) {
    return;
  }
  getPostHogClient().capture({ distinctId: getRequestUserId(), event, properties });
};

/**
 * Capture an exception, if posthog is enabled.
 * @param error The error to capture.
 */
export const captureException = (error: Error) => {
  if (!isPostHogEnabled) {
    return;
  }
  getPostHogClient().captureException(error, getRequestUserId());
};
