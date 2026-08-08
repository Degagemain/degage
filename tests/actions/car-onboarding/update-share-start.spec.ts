import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus, startOfMonth } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingInvalidInsurerStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-insurer-status.error';
import { CarOnboardingInvalidShareStartDateError } from '@/actions/car-onboarding/car-onboarding-invalid-share-start-date.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { updateCarOnboardingShareStart } from '@/actions/car-onboarding/update-share-start';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const otherUser = { id: 'user-2', role: 'user', banned: false };

describe('updateCarOnboardingShareStart', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('saves a valid first-of-month share start date', async () => {
    const today = new Date();
    const shareStartDate = startOfMonth(today);
    const iso = `${shareStartDate.getFullYear()}-${String(shareStartDate.getMonth() + 1).padStart(2, '0')}-01`;
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        shareStartDate: null,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        shareStartDate,
      }),
    );
  });

  it('rejects when insurer step is incomplete', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        insurerStatus: CarOnboardingInsurerStatus.TODO,
      }),
    );

    const shareStartDate = startOfMonth(new Date());
    const iso = `${shareStartDate.getFullYear()}-${String(shareStartDate.getMonth() + 1).padStart(2, '0')}-01`;
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso }, owner)).rejects.toThrow(
      CarOnboardingInvalidInsurerStatusError,
    );

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('rejects dates that are not the first of the month', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      }),
    );

    const midMonth = new Date();
    const iso = `${midMonth.getFullYear()}-${String(midMonth.getMonth() + 1).padStart(2, '0')}-15`;
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso }, owner)).rejects.toThrow(
      CarOnboardingInvalidShareStartDateError,
    );

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      }),
    );

    const shareStartDate = startOfMonth(new Date());
    const iso = `${shareStartDate.getFullYear()}-${String(shareStartDate.getMonth() + 1).padStart(2, '0')}-01`;
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso }, otherUser)).rejects.toThrow(CarOnboardingForbiddenError);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    const shareStartDate = startOfMonth(new Date());
    const iso = `${shareStartDate.getFullYear()}-${String(shareStartDate.getMonth() + 1).padStart(2, '0')}-01`;
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso }, owner)).rejects.toThrow(CarOnboardingLockedError);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
