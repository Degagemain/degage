import posthog from 'posthog-js';

export const capture = (event: string, properties?: Record<string, string | number | boolean | null>) => {
  if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
    posthog.capture(event, properties);
  }
};
