import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/confirm-info-session', () => ({
  confirmCarOnboardingInfoSession: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/info-session/confirm/route';
import { auth } from '@/auth';
import { confirmCarOnboardingInfoSession } from '@/actions/car-onboarding/confirm-info-session';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/info-session/confirm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await PUT({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(confirmCarOnboardingInfoSession).not.toHaveBeenCalled();
  });

  it('returns 403 when user is not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    const response = await PUT({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    expect(confirmCarOnboardingInfoSession).not.toHaveBeenCalled();
  });

  it('returns 204 when admin confirms attendance', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as any);
    vi.mocked(confirmCarOnboardingInfoSession).mockResolvedValueOnce(undefined);
    const response = await PUT({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(confirmCarOnboardingInfoSession).toHaveBeenCalledWith(validId, mockAdmin);
  });

  it('returns 403 when action rejects non-admin caller', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as any);
    vi.mocked(confirmCarOnboardingInfoSession).mockRejectedValueOnce(new CarOnboardingForbiddenError());
    const response = await PUT({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
  });
});
