import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/posthog', () => ({
  isPostHogEnabled: true,
  captureEvent: vi.fn(),
  captureException: vi.fn(),
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

describe('logger under NODE_ENV=production', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('warn maps to backend_log capture', async () => {
    const posthog = await import('@/integrations/posthog');
    const { logger: prodLogger } = await import('@/lib/logger');

    prodLogger.warn('hello', { detail: 1 });

    expect(posthog.captureEvent).toHaveBeenCalledWith(
      'backend_log',
      expect.objectContaining({
        level: 'warn',
        message: 'hello',
        detail: 1,
      }),
    );
  });

  it('exception delegates to captureException', async () => {
    const posthog = await import('@/integrations/posthog');
    const { logger: prodLogger } = await import('@/lib/logger');

    prodLogger.exception(new Error('boom'), { simulationPhase: 'x' });

    expect(posthog.captureException).toHaveBeenCalledWith(expect.any(Error), { simulationPhase: 'x' });
  });
});
