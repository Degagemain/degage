import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/check-car-name-availability', () => ({
  checkCarOnboardingCarNameAvailability: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/car-onboardings/[id]/car-name-availability/route';
import { checkCarOnboardingCarNameAvailability } from '@/actions/car-onboarding/check-car-name-availability';
import { auth } from '@/auth';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/car-onboardings/[id]/car-name-availability', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { nextUrl: { searchParams: new URLSearchParams('carName=MyCar') } } as any;
    const response = await GET(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
  });

  it('returns availability result', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(checkCarOnboardingCarNameAvailability).mockResolvedValueOnce({ available: true });

    const request = { nextUrl: { searchParams: new URLSearchParams('carName=MyCar') } } as any;
    const response = await GET(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ available: true });
    expect(checkCarOnboardingCarNameAvailability).toHaveBeenCalledWith(validId, 'MyCar', mockUser);
  });
});
