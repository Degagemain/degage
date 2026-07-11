import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/update-insurer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/car-onboarding/update-insurer')>();
  return {
    updateCarOnboardingInsurer: vi.fn(actual.updateCarOnboardingInsurer),
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

import { PUT } from '@/api/car-onboardings/[id]/insurer/route';
import { auth } from '@/auth';
import { updateCarOnboardingInsurer } from '@/actions/car-onboarding/update-insurer';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus } from '@/domain/car-onboarding.model';
import { carOnboarding } from '../../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/insurer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };
  const mockOtherUser = { id: 'other-user-id', name: 'Other', email: 'other@example.com', role: 'user', banned: false };
  const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const body = {
    hasInsurance: true,
    insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
    insurerContractStartedAt: '2020-01-15',
  };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(updateCarOnboardingInsurer).not.toHaveBeenCalled();
  });

  it('returns 204 when owner updates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: validId, owner: { id: mockUser.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: validId }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(updateCarOnboardingInsurer).toHaveBeenCalledWith(validId, body, mockUser);
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
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('returns 400 when insurer status is not todo', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: validId, owner: { id: mockUser.id }, insurerStatus: CarOnboardingInsurerStatus.READY }),
    );
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('invalid_insurer_status');
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
