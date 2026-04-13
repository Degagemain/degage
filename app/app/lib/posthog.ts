import posthog from 'posthog-js';

const isPostHogClientEnabled = () => !!(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);

export const capture = (event: string, properties?: Record<string, string | number | boolean | null>) => {
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
