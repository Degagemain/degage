import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

import posthog from 'posthog-js';
import type { CaptureResult } from 'posthog-js';
import { capture, dropScannerExceptions, identifyPostHogUser, resetPostHog } from '@/app/lib/posthog';
import { AnalyticsEvent } from '@/domain/analytics-event.model';

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
    capture(AnalyticsEvent.SIMULATION, { key: 'value' });
    expect(posthog.capture).toHaveBeenCalledWith(AnalyticsEvent.SIMULATION, { key: 'value' });
  });

  it('does nothing when env vars are missing', () => {
    capture(AnalyticsEvent.SIMULATION);
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

describe('dropScannerExceptions', () => {
  const exceptionEvent = (value: string): CaptureResult => ({
    uuid: 'event-1',
    event: '$exception',
    properties: { $exception_list: [{ type: 'UnhandledRejection', value }] },
  });

  it('drops the Outlook Safe Links scanner rejection', () => {
    const event = exceptionEvent(
      'Non-Error promise rejection captured with value: Object Not Found Matching Id:2, MethodName:update, ParamCount:4',
    );
    expect(dropScannerExceptions(event)).toBeNull();
  });

  it('keeps other exceptions', () => {
    const event = exceptionEvent('Failed to fetch');
    expect(dropScannerExceptions(event)).toBe(event);
  });

  it('keeps non-exception events', () => {
    const event: CaptureResult = { uuid: 'event-2', event: '$pageview', properties: {} };
    expect(dropScannerExceptions(event)).toBe(event);
  });

  it('keeps exception events without an exception list', () => {
    const event: CaptureResult = { uuid: 'event-3', event: '$exception', properties: {} };
    expect(dropScannerExceptions(event)).toBe(event);
  });
});
