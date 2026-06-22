import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/read-for-caller', () => ({
  readCarOnboardingForCaller: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/update', () => ({
  updateCarOnboarding: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, PUT } from '@/api/car-onboardings/[id]/route';
import { auth } from '@/auth';
import { readCarOnboardingForCaller } from '@/actions/car-onboarding/read-for-caller';
import { updateCarOnboarding } from '@/actions/car-onboarding/update';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/car-onboardings/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(readCarOnboardingForCaller).not.toHaveBeenCalled();
  });

  it('returns 200 when caller is allowed', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(readCarOnboardingForCaller).mockResolvedValueOnce(carOnboarding({ id: validId }));
    const response = await GET({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(200);
    expect(readCarOnboardingForCaller).toHaveBeenCalledWith(validId, mockUser);
  });

  it('returns 403 when caller is not owner or admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(readCarOnboardingForCaller).mockRejectedValueOnce(new CarOnboardingForbiddenError());
    const response = await GET({} as any, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
  });
});

describe('PUT /api/car-onboardings/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdminUser = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const mockRegularUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };
  const updateBody = carOnboarding({ id: validId });

  it('returns 403 when regular user attempts to update', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
    const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    expect(updateCarOnboarding).not.toHaveBeenCalled();
  });

  it('returns 400 when id in body does not match path', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
    const otherId = '660e8400-e29b-41d4-a716-446655440000';
    const request = { json: vi.fn().mockResolvedValue({ ...updateBody, id: otherId }) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('id_mismatch');
    expect(updateCarOnboarding).not.toHaveBeenCalled();
  });

  it('returns 204 when admin updates with matching id', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
    vi.mocked(updateCarOnboarding).mockResolvedValueOnce(updateBody);
    const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(updateCarOnboarding).toHaveBeenCalledWith(updateBody);
  });
});
