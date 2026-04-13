import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

import posthog from 'posthog-js';
import { capture, identifyPostHogUser, resetPostHog } from '@/app/lib/posthog';

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

const enablePostHog = () => {
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN', 'phc_test');
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://eu.i.posthog.com');
};

describe('capture', () => {
  it('delegates to posthog.capture when enabled', () => {
    enablePostHog();
    capture('test_event', { key: 'value' });
    expect(posthog.capture).toHaveBeenCalledWith('test_event', { key: 'value' });
  });

  it('does nothing when env vars are missing', () => {
    capture('test_event');
    expect(posthog.capture).not.toHaveBeenCalled();
  });
});

describe('identifyPostHogUser', () => {
  it('calls posthog.identify with user properties when enabled', () => {
    enablePostHog();
    identifyPostHogUser('user-123', 'a@b.com', 'admin', 'Alice');
    expect(posthog.identify).toHaveBeenCalledWith('user-123', {
      email: 'a@b.com',
      role: 'admin',
      name: 'Alice',
    });
  });

  it('sets name to empty string when null', () => {
    enablePostHog();
    identifyPostHogUser('user-123', 'a@b.com', 'user', null);
    expect(posthog.identify).toHaveBeenCalledWith('user-123', {
      email: 'a@b.com',
      role: 'user',
      name: '',
    });
  });

  it('does nothing when env vars are missing', () => {
    identifyPostHogUser('user-123', 'a@b.com', 'user', 'Alice');
    expect(posthog.identify).not.toHaveBeenCalled();
  });
});

describe('resetPostHog', () => {
  it('calls posthog.reset when enabled', () => {
    enablePostHog();
    resetPostHog();
    expect(posthog.reset).toHaveBeenCalled();
  });

  it('does nothing when env vars are missing', () => {
    resetPostHog();
    expect(posthog.reset).not.toHaveBeenCalled();
  });
});
