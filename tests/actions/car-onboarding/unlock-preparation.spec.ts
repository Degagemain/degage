import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { unlockCarOnboardingPreparation } from '@/actions/car-onboarding/unlock-preparation';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { completeCarOnboarding } from '../../builders/car-onboarding.builder';

describe('unlockCarOnboardingPreparation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const admin = { id: 'admin-1', role: 'admin', banned: false };
  const user = { id: 'user-1', role: 'user', banned: false };
  const id = '550e8400-e29b-41d4-a716-446655440000';

  it('throws when caller is not admin', async () => {
    await expect(unlockCarOnboardingPreparation(id, user)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(dbCarOnboardingReadWithRelations).not.toHaveBeenCalled();
  });

  it('unlocks locked preparation and recalculates status', async () => {
    const locked = completeCarOnboarding({
      id,
      statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
    });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(locked);
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce({
      ...locked,
      statusInPreparation: CarOnboardingInPreparationStatus.READY,
    });

    await unlockCarOnboardingPreparation(id, admin);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith({
      ...locked,
      statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
    });
  });

  it('is a no-op when not locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      completeCarOnboarding({
        id,
        statusInPreparation: CarOnboardingInPreparationStatus.READY,
      }),
    );

    await unlockCarOnboardingPreparation(id, admin);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
