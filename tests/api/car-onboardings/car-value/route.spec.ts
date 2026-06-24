import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/update-car-value', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/car-onboarding/update-car-value')>();
  return {
    updateCarOnboardingCarValue: vi.fn(actual.updateCarOnboardingCarValue),
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

import { PUT } from '@/api/car-onboardings/[id]/car-value/route';
import { auth } from '@/auth';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { CarOnboardingCarValueStatus } from '@/domain/car-onboarding.model';
import { carOnboarding } from '../../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/car-value', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };
  const body = { carValueCounterProposal: 14_000, carValueCounterProposalMessage: 'Counter offer' };

  it('returns 204 when owner submits counter from proposal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: validId,
        owner: { id: mockUser.id },
        carValueStatus: CarOnboardingCarValueStatus.PROPOSAL,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: validId }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
  });

  it('returns 400 when status is not proposal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: validId, owner: { id: mockUser.id } }));
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('invalid_car_value_status');
  });
});
