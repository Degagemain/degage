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
    });
  }
  return posthogClient;
};

export const flushPostHogEvents = async (): Promise<void> => {
  if (!posthogClient) return;
  await posthogClient.flush();
};

function getServerDistinctId(): string {
  const userId = getRequestUserId();
  if (userId) return userId;
  const rid = getRequestId();
  return rid ? `anon:${rid}` : 'anonymous-server';
}

function buildEventProperties(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, string | number | any>,
): Record<string, unknown> {
  const requestId = getRequestId();
  return {
    ...(properties ?? {}),
    ...(requestId != null ? { request_id: requestId } : {}),
  };
}

export const captureEvent = (
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, string | number | any>,
) => {
  if (!isPostHogEnabled) {
    return;
  }
  getPostHogClient().capture({
    distinctId: getServerDistinctId(),
    event,
    properties: buildEventProperties(properties),
  });
};

export const captureImmediate = async (
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, string | number | any>,
): Promise<void> => {
  if (!isPostHogEnabled) {
    return;
  }
  await getPostHogClient().captureImmediate({
    distinctId: getServerDistinctId(),
    event,
    properties: buildEventProperties(properties),
  });
};

export const captureException = (error: unknown, additionalProperties?: Record<string, unknown>) => {
  if (!isPostHogEnabled) {
    return;
  }
  const requestId = getRequestId();
  getPostHogClient().captureException(error, getServerDistinctId(), {
    ...additionalProperties,
    ...(requestId != null ? { request_id: requestId } : {}),
  });
};
