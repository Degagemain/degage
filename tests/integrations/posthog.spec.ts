import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const capture = vi.fn();
const captureImmediate = vi.fn().mockResolvedValue(undefined);
const flush = vi.fn().mockResolvedValue(undefined);
const captureException = vi.fn();

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(function PostHog() {
    return {
      capture,
      captureImmediate,
      flush,
      captureException,
    };
  }),
}));

vi.mock('@/context/request-context', () => ({
  getRequestId: vi.fn(() => 'req-1'),
  getRequestUserId: vi.fn(() => 'user-1'),
}));

describe('integrations/posthog', () => {
  const originalToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const originalHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = 'phc_test';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = originalToken;
    process.env.NEXT_PUBLIC_POSTHOG_HOST = originalHost;
    vi.clearAllMocks();
  });

  it('flushPostHogEvents is a no-op when no client was created', async () => {
    const { flushPostHogEvents } = await import('@/integrations/posthog');
    const { PostHog } = await import('posthog-node');

    await flushPostHogEvents();

    expect(PostHog).not.toHaveBeenCalled();
    expect(flush).not.toHaveBeenCalled();
  });

  it('flushPostHogEvents flushes an already-created client', async () => {
    const { captureEvent, flushPostHogEvents } = await import('@/integrations/posthog');

    captureEvent('test_event');
    await flushPostHogEvents();

    expect(flush).toHaveBeenCalledTimes(1);
  });

  it('captureImmediate awaits PostHog captureImmediate', async () => {
    const { captureImmediate: captureImmediateEvent } = await import('@/integrations/posthog');

    await captureImmediateEvent('user signed up', { method: 'email' });

    expect(captureImmediate).toHaveBeenCalledWith({
      distinctId: 'user-1',
      event: 'user signed up',
      properties: { method: 'email', request_id: 'req-1' },
    });
  });

  it('getPostHogClient does not set flushAt or flushInterval', async () => {
    const { getPostHogClient } = await import('@/integrations/posthog');
    const { PostHog } = await import('posthog-node');

    getPostHogClient();

    expect(PostHog).toHaveBeenCalledWith('phc_test', {
      host: 'https://eu.i.posthog.com',
    });
  });
});
