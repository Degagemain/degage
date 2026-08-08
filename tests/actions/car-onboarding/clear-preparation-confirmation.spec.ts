import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { clearCarOnboardingPreparationConfirmation } from '@/actions/car-onboarding/clear-preparation-confirmation';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { completeCarOnboarding } from '../../builders/car-onboarding.builder';

describe('clearCarOnboardingPreparationConfirmation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const admin = { id: 'admin-1', role: 'admin', banned: false };
  const user = { id: 'user-1', role: 'user', banned: false };
  const id = '550e8400-e29b-41d4-a716-446655440000';

  it('throws when caller is not admin', async () => {
    await expect(clearCarOnboardingPreparationConfirmation(id, user)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(dbCarOnboardingReadWithRelations).not.toHaveBeenCalled();
  });

  it('throws when preparation is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      completeCarOnboarding({
        id,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(clearCarOnboardingPreparationConfirmation(id, admin)).rejects.toThrow(CarOnboardingLockedError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('clears preparationConfirmedAt when set', async () => {
    const confirmed = completeCarOnboarding({
      id,
      statusInPreparation: CarOnboardingInPreparationStatus.READY,
      preparationConfirmedAt: new Date('2026-06-21T10:00:00'),
    });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(confirmed);
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce({
      ...confirmed,
      preparationConfirmedAt: null,
      statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
    });

    await clearCarOnboardingPreparationConfirmation(id, admin);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith({
      ...confirmed,
      preparationConfirmedAt: null,
    });
  });

  it('is a no-op when not confirmed', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      completeCarOnboarding({
        id,
        preparationConfirmedAt: null,
        statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
      }),
    );

    await clearCarOnboardingPreparationConfirmation(id, admin);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
