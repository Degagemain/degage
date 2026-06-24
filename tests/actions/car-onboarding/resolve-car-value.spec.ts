import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingCarValueStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingInvalidCarValueStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-car-value-status.error';
import { resolveCarOnboardingCarValue } from '@/actions/car-onboarding/resolve-car-value';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };

describe('resolveCarOnboardingCarValue', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('moves status to resolved when in proposal', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        carValueStatus: CarOnboardingCarValueStatus.PROPOSAL,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: onboardingId }));

    await resolveCarOnboardingCarValue(onboardingId, { carValueStatus: CarOnboardingCarValueStatus.RESOLVED }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        carValueStatus: CarOnboardingCarValueStatus.RESOLVED,
      }),
    );
  });

  it('throws when status is not proposal', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));

    await expect(resolveCarOnboardingCarValue(onboardingId, { carValueStatus: CarOnboardingCarValueStatus.RESOLVED }, owner)).rejects.toThrow(
      CarOnboardingInvalidCarValueStatusError,
    );
  });
});
