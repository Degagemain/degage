import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/update-share-start', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/car-onboarding/update-share-start')>();
  return {
    updateCarOnboardingShareStart: vi.fn(actual.updateCarOnboardingShareStart),
  };
});

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/assert-car-name-available', () => ({
  assertCarOnboardingCarNameAvailable: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/share-start/route';
import { auth } from '@/auth';
import { updateCarOnboardingShareStart } from '@/actions/car-onboarding/update-share-start';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { assertCarOnboardingCarNameAvailable } from '@/actions/car-onboarding/assert-car-name-available';
import { CarOnboardingInsurerStatus, startOfMonth } from '@/domain/car-onboarding.model';
import { carOnboarding } from '../../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/share-start', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };
  const shareStartDate = startOfMonth(new Date());
  const body = {
    shareStartDate: `${shareStartDate.getFullYear()}-${String(shareStartDate.getMonth() + 1).padStart(2, '0')}-01`,
    carName: 'MyCar',
  };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(updateCarOnboardingShareStart).not.toHaveBeenCalled();
  });

  it('returns 204 when owner updates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: validId,
        owner: { id: mockUser.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      }),
    );
    vi.mocked(assertCarOnboardingCarNameAvailable).mockResolvedValueOnce(undefined);
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: validId }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(updateCarOnboardingShareStart).toHaveBeenCalledWith(validId, body, mockUser);
  });

  it('returns 400 for invalid share start date', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: validId,
        owner: { id: mockUser.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      }),
    );
    const midMonth = new Date();
    const request = {
      json: vi.fn().mockResolvedValue({
        shareStartDate: `${midMonth.getFullYear()}-${String(midMonth.getMonth() + 1).padStart(2, '0')}-15`,
        carName: 'MyCar',
      }),
    } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('invalid_share_start_date');
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
