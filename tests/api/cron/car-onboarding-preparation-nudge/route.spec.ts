import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue(null) } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

vi.mock('@/actions/car-onboarding/nudge-preparation', () => ({
  nudgeDueCarOnboardingPreparations: vi.fn(),
}));

import { GET } from '@/api/cron/car-onboarding-preparation-nudge/route';
import { nudgeDueCarOnboardingPreparations } from '@/actions/car-onboarding/nudge-preparation';

describe('GET /api/cron/car-onboarding-preparation-nudge', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-test-secret';
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = originalCronSecret;
  });

  it('returns 401 when the bearer token is missing', async () => {
    const request = new NextRequest('http://localhost/api/cron/car-onboarding-preparation-nudge');
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(nudgeDueCarOnboardingPreparations).not.toHaveBeenCalled();
  });

  it('returns 401 when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;
    const request = new NextRequest('http://localhost/api/cron/car-onboarding-preparation-nudge', {
      headers: { authorization: 'Bearer cron-test-secret' },
    });
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(nudgeDueCarOnboardingPreparations).not.toHaveBeenCalled();
  });

  it('runs the nudge action when authorized', async () => {
    vi.mocked(nudgeDueCarOnboardingPreparations).mockResolvedValueOnce({ sent: 3 });
    const request = new NextRequest('http://localhost/api/cron/car-onboarding-preparation-nudge', {
      headers: { authorization: 'Bearer cron-test-secret' },
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: 3 });
    expect(nudgeDueCarOnboardingPreparations).toHaveBeenCalledTimes(1);
  });
});
