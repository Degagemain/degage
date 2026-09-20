import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/assert-car-name-available', () => ({
  assertCarOnboardingCarNameAvailable: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus, ceilToFirstOfMonth, startOfMonth } from '@/domain/car-onboarding.model';
import { assertCarOnboardingCarNameAvailable } from '@/actions/car-onboarding/assert-car-name-available';
import { CarOnboardingCarNameTakenError } from '@/actions/car-onboarding/car-onboarding-car-name-taken.error';
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

const isoFirstOfMonth = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

describe('updateCarOnboardingShareStart', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('saves a valid first-of-month share start date and car name', async () => {
    const shareStartDate = ceilToFirstOfMonth(new Date());
    const iso = isoFirstOfMonth(shareStartDate);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        shareStartDate: null,
        carName: null,
      }),
    );
    vi.mocked(assertCarOnboardingCarNameAvailable).mockResolvedValueOnce(undefined);
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner);

    expect(assertCarOnboardingCarNameAvailable).toHaveBeenCalledWith('MyCar', { excludeOnboardingId: onboardingId });
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        shareStartDate,
        carName: 'MyCar',
      }),
    );
  });

  it('skips availability assert when car name is unchanged', async () => {
    const shareStartDate = ceilToFirstOfMonth(new Date());
    const iso = isoFirstOfMonth(shareStartDate);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        carName: 'MyCar',
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'mycar' }, owner);

    expect(assertCarOnboardingCarNameAvailable).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(expect.objectContaining({ carName: 'mycar' }));
  });

  it('rejects when car name is taken', async () => {
    const shareStartDate = ceilToFirstOfMonth(new Date());
    const iso = isoFirstOfMonth(shareStartDate);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        carName: null,
      }),
    );
    vi.mocked(assertCarOnboardingCarNameAvailable).mockRejectedValueOnce(new CarOnboardingCarNameTakenError());

    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'Taken' }, owner)).rejects.toThrow(
      CarOnboardingCarNameTakenError,
    );
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
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
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner)).rejects.toThrow(
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
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner)).rejects.toThrow(
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
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, otherUser)).rejects.toThrow(
      CarOnboardingForbiddenError,
    );

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
    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner)).rejects.toThrow(
      CarOnboardingLockedError,
    );

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('allows the first of next month when the insurer supports instant onboarding', async () => {
    const earliest = ceilToFirstOfMonth(new Date());
    const iso = isoFirstOfMonth(earliest);
    const today = new Date();
    const recentContractStart = new Date(today.getFullYear(), today.getMonth() - 3, 15);

    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: true,
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010', name: 'AXA', supportsInstantOnboarding: true },
        insurerStatus: CarOnboardingInsurerStatus.READY,
        insurerContractStartedAt: recentContractStart,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));
    vi.mocked(assertCarOnboardingCarNameAvailable).mockResolvedValueOnce();

    await updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        shareStartDate: earliest,
        carName: 'MyCar',
      }),
    );
  });

  it('keeps an already-saved current-month date when there is no insurance contract', async () => {
    const shareStartDate = startOfMonth(new Date());
    const iso = isoFirstOfMonth(shareStartDate);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        shareStartDate,
        carName: 'MyCar',
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        shareStartDate,
        carName: 'MyCar',
      }),
    );
  });

  it.skipIf(new Date().getDate() === 1)('rejects a new current-month date after the 1st when there is no insurance contract', async () => {
    const shareStartDate = startOfMonth(new Date());
    const iso = isoFirstOfMonth(shareStartDate);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        shareStartDate: null,
        carName: null,
      }),
    );

    await expect(updateCarOnboardingShareStart(onboardingId, { shareStartDate: iso, carName: 'MyCar' }, owner)).rejects.toThrow(
      CarOnboardingInvalidShareStartDateError,
    );
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
