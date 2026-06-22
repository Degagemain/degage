import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/unenroll-info-session', () => ({
  unenrollCarOnboardingInfoSession: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/info-session/unenroll/route';
import { auth } from '@/auth';
import { unenrollCarOnboardingInfoSession } from '@/actions/car-onboarding/unenroll-info-session';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/info-session/unenroll', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await PUT({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(unenrollCarOnboardingInfoSession).not.toHaveBeenCalled();
  });

  it('returns 204 when unenroll succeeds', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(unenrollCarOnboardingInfoSession).mockResolvedValueOnce(undefined);
    const response = await PUT({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(unenrollCarOnboardingInfoSession).toHaveBeenCalledWith(validId, mockUser);
  });
});
