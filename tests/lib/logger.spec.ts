import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/posthog', () => ({
  captureEvent: vi.fn(),
  captureException: vi.fn(),
  isPostHogEnabled: true,
}));

vi.mock('@/context/request-context', () => ({
  getRequestId: vi.fn(() => 'req-test'),
  getRequestUserId: vi.fn(() => 'user-test'),
}));

import { captureEvent, captureException } from '@/integrations/posthog';
import { logger, toError } from '@/lib/logger';

describe('toError', () => {
  it('returns Error instances unchanged', () => {
    const err = new Error('x');
    expect(toError(err)).toBe(err);
  });

  it('wraps non-errors', () => {
    expect(toError('oops').message).toBe('oops');
  });
});

describe('logger', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not send routine logs as PostHog analytics events (captureEvent)', () => {
    logger.warn('hello', { detail: 1 });
    logger.info('hi');
    logger.error('oops');

    expect(captureEvent).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it('sends exceptions to PostHog when enabled', () => {
    logger.exception(new Error('boom'), { k: 'v' });

    expect(captureException).toHaveBeenCalledWith(expect.any(Error), { k: 'v' });
  });
});
