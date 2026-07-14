import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { confirmCarOnboardingInfoSession } from '@/actions/car-onboarding/confirm-info-session';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const mockAdmin = { id: 'admin-1', role: 'admin', banned: false };
const mockUser = { id: 'user-1', role: 'user', banned: false };

describe('confirmCarOnboardingInfoSession', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets info session status to done for admin', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, infoSessionStatus: CarOnboardingInfoSessionStatus.DONE }),
    );

    await confirmCarOnboardingInfoSession(onboardingId, mockAdmin);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        infoSessionStatus: CarOnboardingInfoSessionStatus.DONE,
      }),
    );
  });

  it('does nothing when status is already done', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        infoSessionStatus: CarOnboardingInfoSessionStatus.DONE,
      }),
    );

    await confirmCarOnboardingInfoSession(onboardingId, mockAdmin);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when caller is not admin', async () => {
    await expect(confirmCarOnboardingInfoSession(onboardingId, mockUser)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('sets info session status to done for admin when status is todo', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, infoSessionStatus: CarOnboardingInfoSessionStatus.DONE }),
    );

    await confirmCarOnboardingInfoSession(onboardingId, mockAdmin);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        infoSessionStatus: CarOnboardingInfoSessionStatus.DONE,
      }),
    );
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );

    await expect(confirmCarOnboardingInfoSession(onboardingId, mockAdmin)).rejects.toThrow();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
