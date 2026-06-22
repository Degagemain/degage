import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/update-car-info', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/car-onboarding/update-car-info')>();
  return {
    updateCarOnboardingCarInfo: vi.fn(actual.updateCarOnboardingCarInfo),
  };
});

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/car-info/route';
import { auth } from '@/auth';
import { updateCarOnboardingCarInfo } from '@/actions/car-onboarding/update-car-info';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { carOnboarding } from '../../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/car-info', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };
  const mockOtherUser = { id: 'other-user-id', name: 'Other', email: 'other@example.com', role: 'user', banned: false };
  const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const body = {
    brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
    fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
    carType: { id: '550e8400-e29b-41d4-a716-446655440003' },
  };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(updateCarOnboardingCarInfo).not.toHaveBeenCalled();
  });

  it('returns 204 when owner updates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: validId, owner: { id: mockUser.id } }));
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: validId }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(updateCarOnboardingCarInfo).toHaveBeenCalledWith(validId, body, mockUser);
  });

  it('returns 204 when admin updates a record owned by someone else', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdmin } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: validId, owner: { id: mockUser.id } }));
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: validId }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(updateCarOnboardingCarInfo).toHaveBeenCalledWith(validId, body, mockAdmin);
  });

  it('returns 403 when non-owner non-admin attempts update', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockOtherUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: validId, owner: { id: mockUser.id } }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.code).toBe('forbidden');
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('returns 403 when onboarding is locked', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: validId,
        owner: { id: mockUser.id },
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.code).toBe('forbidden');
  });

  it('returns 400 when body is invalid', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: validId, owner: { id: mockUser.id } }));
    const request = { json: vi.fn().mockResolvedValue({ brand: { id: validId } }) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('validation_error');
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
