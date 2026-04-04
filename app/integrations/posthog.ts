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

export const captureEvent = (event: string, userId: string, properties?: Record<string, string | number | boolean | null>) => {
  if (!isPostHogEnabled) {
    return;
  }
  getPostHogClient().capture({ distinctId: userId, event, properties });
};

export const captureAnonymousEvent = (event: string, properties?: Record<string, string | number | boolean | null>) => {
  if (!isPostHogEnabled) {
    return;
  }
  getPostHogClient().capture({ event, properties });
};
