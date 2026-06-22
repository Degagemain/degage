import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.update', () => ({
  dbCarOnboardingUpdate: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingPreparationNotReadyError } from '@/actions/car-onboarding/car-onboarding-preparation-not-ready.error';
import { startCarOnboarding } from '@/actions/car-onboarding/start';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';
import { completeCarOnboarding } from '../../builders/car-onboarding.builder';

describe('startCarOnboarding', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const admin = { id: 'admin-1', role: 'admin', banned: false };
  const user = { id: 'user-1', role: 'user', banned: false };
  const id = '550e8400-e29b-41d4-a716-446655440000';

  it('throws when caller is not admin', async () => {
    await expect(startCarOnboarding(id, user)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(dbCarOnboardingReadWithRelations).not.toHaveBeenCalled();
  });

  it('throws when preparation is not ready', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      completeCarOnboarding({
        id,
        statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
      }),
    );

    await expect(startCarOnboarding(id, admin)).rejects.toThrow(CarOnboardingPreparationNotReadyError);
    expect(dbCarOnboardingUpdate).not.toHaveBeenCalled();
  });

  it('locks preparation when status is ready', async () => {
    const ready = completeCarOnboarding({
      id,
      statusInPreparation: CarOnboardingInPreparationStatus.READY,
    });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(ready);
    vi.mocked(dbCarOnboardingUpdate).mockResolvedValueOnce({
      ...ready,
      statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
    });

    await startCarOnboarding(id, admin);

    expect(dbCarOnboardingUpdate).toHaveBeenCalledWith({
      ...ready,
      statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
    });
  });

  it('is a no-op when already locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      completeCarOnboarding({
        id,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await startCarOnboarding(id, admin);

    expect(dbCarOnboardingUpdate).not.toHaveBeenCalled();
  });
});
