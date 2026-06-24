import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingCarValueStatus, CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { overruleCarOnboardingCarValueAgreement } from '@/actions/car-onboarding/overrule-car-value-agreement';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const mockAdmin = { id: 'admin-1', role: 'admin', banned: false };
const mockUser = { id: 'user-1', role: 'user', banned: false };

describe('overruleCarOnboardingCarValueAgreement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets car value status to resolved for admin', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        carValueStatus: CarOnboardingCarValueStatus.TODO,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, carValueStatus: CarOnboardingCarValueStatus.RESOLVED }),
    );

    await overruleCarOnboardingCarValueAgreement(onboardingId, mockAdmin);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        carValueStatus: CarOnboardingCarValueStatus.RESOLVED,
      }),
    );
  });

  it('does nothing when status is already resolved', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        carValueStatus: CarOnboardingCarValueStatus.RESOLVED,
      }),
    );

    await overruleCarOnboardingCarValueAgreement(onboardingId, mockAdmin);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when caller is not admin', async () => {
    await expect(overruleCarOnboardingCarValueAgreement(onboardingId, mockUser)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(overruleCarOnboardingCarValueAgreement(onboardingId, mockAdmin)).rejects.toThrow(CarOnboardingLockedError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
