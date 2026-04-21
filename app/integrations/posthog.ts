import { getRequestId, getRequestUserId } from '@/context/request-context';
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

function getServerDistinctId(): string {
  const userId = getRequestUserId();
  if (userId) return userId;
  const rid = getRequestId();
  return rid ? `anon:${rid}` : 'anonymous-server';
}

/**
 * Capture an event, if posthog is enabled.
 * Adds correlation fields from request context when present.
 */
export const captureEvent = (
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, string | number | any>,
) => {
  if (!isPostHogEnabled) {
    return;
  }
  const requestId = getRequestId();
  const merged = {
    ...(properties ?? {}),
    ...(requestId != null ? { request_id: requestId } : {}),
  };
  getPostHogClient().capture({ distinctId: getServerDistinctId(), event, properties: merged });
};

/**
 * Capture an exception, if posthog is enabled.
 */
export const captureException = (
  error: unknown,
  additionalProperties?: Record<string, unknown>,
) => {
  if (!isPostHogEnabled) {
    return;
  }
  const requestId = getRequestId();
  getPostHogClient().captureException(error, getServerDistinctId(), {
    ...additionalProperties,
    ...(requestId != null ? { request_id: requestId } : {}),
  });
};
