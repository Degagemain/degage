import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/connect-play-connector', () => ({
  connectCarOnboardingPlayConnector: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/play-connector/route';
import { auth } from '@/auth';
import { connectCarOnboardingPlayConnector } from '@/actions/car-onboarding/connect-play-connector';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/play-connector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await PUT({ json: async () => ({}) } as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(connectCarOnboardingPlayConnector).not.toHaveBeenCalled();
  });

  it('returns connector status when connect succeeds', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(connectCarOnboardingPlayConnector).mockResolvedValueOnce({
      status: 'success',
      email: 'user@example.com',
      loginBlockedUntil: null,
      sessionExpiresAt: null,
    });

    const response = await PUT({ json: async () => ({ email: 'user@example.com', password: 'secret' }) } as any, {
      params: Promise.resolve({ id: validId }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('success');
    expect(connectCarOnboardingPlayConnector).toHaveBeenCalledWith(validId, { email: 'user@example.com', password: 'secret' }, mockUser);
  });
});
