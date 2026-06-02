import posthog from 'posthog-js';

const isPostHogClientEnabled = () => !!(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);

export type PostHogPersonProperties = {
  email?: string;
  role?: string;
  name?: string;
  locale?: string;
  auth_method?: string;
  has_completed_simulation?: boolean;
  last_simulation_result_code?: string | null;
};

export const capture = (event: string, properties?: Record<string, string | number | boolean | null>) => {
  if (isPostHogClientEnabled()) {
    posthog.capture(event, properties);
  }
};

export const setPostHogPersonProperties = (properties: PostHogPersonProperties) => {
  if (!isPostHogClientEnabled()) return;
  posthog.setPersonProperties(properties);
};

export const identifyPostHogUser = (
  distinctId: string,
  email: string,
  role: string,
  name: string | null,
  properties?: Pick<PostHogPersonProperties, 'locale' | 'auth_method'>,
) => {
  if (!isPostHogClientEnabled()) return;
  posthog.identify(distinctId, {
    email,
    role,
    name: name ?? '',
    ...properties,
  });
};

export const resetPostHog = () => {
  if (!isPostHogClientEnabled()) return;
  posthog.reset();
};
