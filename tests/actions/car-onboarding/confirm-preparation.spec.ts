import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { CarOnboardingNotConfirmableError } from '@/actions/car-onboarding/car-onboarding-not-confirmable.error';
import { confirmCarOnboardingPreparation } from '@/actions/car-onboarding/confirm-preparation';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const mockOwner = { id: 'owner-1', role: 'user', banned: false };
const mockOther = { id: 'user-2', role: 'user', banned: false };

const confirmableOnboarding = (overrides: Parameters<typeof completeCarOnboarding>[0] = {}) =>
  completeCarOnboarding({
    id: onboardingId,
    owner: { id: mockOwner.id, hasPlayConnector: true },
    preparationConfirmedAt: null,
    infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
    ...overrides,
  });

describe('confirmCarOnboardingPreparation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets preparationConfirmedAt for the owner when confirmable', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(confirmableOnboarding());
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(
      confirmableOnboarding({ preparationConfirmedAt: new Date('2026-06-21T10:00:00') }),
    );

    await confirmCarOnboardingPreparation(onboardingId, mockOwner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        preparationConfirmedAt: expect.any(Date),
      }),
    );
  });

  it('does nothing when already confirmed', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      confirmableOnboarding({ preparationConfirmedAt: new Date('2026-06-21T10:00:00') }),
    );

    await confirmCarOnboardingPreparation(onboardingId, mockOwner);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when sections are not confirmable', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: mockOwner.id, hasPlayConnector: true },
        preparationConfirmedAt: null,
      }),
    );

    await expect(confirmCarOnboardingPreparation(onboardingId, mockOwner)).rejects.toThrow(CarOnboardingNotConfirmableError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when caller is not owner or admin', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(confirmableOnboarding());

    await expect(confirmCarOnboardingPreparation(onboardingId, mockOther)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      confirmableOnboarding({ statusInPreparation: CarOnboardingInPreparationStatus.LOCKED }),
    );

    await expect(confirmCarOnboardingPreparation(onboardingId, mockOwner)).rejects.toThrow(CarOnboardingLockedError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
