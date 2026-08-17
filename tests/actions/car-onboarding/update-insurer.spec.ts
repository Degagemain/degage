import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { updateCarOnboardingInsurer } from '@/actions/car-onboarding/update-insurer';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const insurerId = '550e8400-e29b-41d4-a716-446655440010';
const owner = { id: 'user-1', role: 'user', banned: false };
const otherUser = { id: 'user-2', role: 'user', banned: false };

describe('updateCarOnboardingInsurer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a selected insurer without a contract start date', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingInsurer(
      onboardingId,
      {
        hasInsuranceContract: true,
        insurer: { id: insurerId, name: 'Ethias', supportsInstantOnboarding: false },
      },
      owner,
    );

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        hasInsuranceContract: true,
        insurer: expect.objectContaining({
          id: insurerId,
          name: 'Ethias',
          supportsInstantOnboarding: false,
        }),
      }),
    );
  });

  it('merges insurer info and saves with preparation check', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    const body = {
      hasInsuranceContract: true,
      insurer: { id: insurerId },
      insurerContractStartedAt: '2020-01-15',
    };

    await updateCarOnboardingInsurer(onboardingId, body, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        hasInsuranceContract: true,
        insurer: expect.objectContaining({
          id: insurerId,
        }),
        insurerContractStartedAt: new Date(body.insurerContractStartedAt),
      }),
    );
  });

  it('accepts hasInsuranceContract false without insurer fields', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingInsurer(onboardingId, { hasInsuranceContract: false }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        hasInsuranceContract: false,
      }),
    );
  });

  it('marks purchased cars without insurance as not applicable when saving insurer step', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        isPurchased: true,
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.TODO,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingInsurer(onboardingId, { hasInsuranceContract: false }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        insurerAnnouncedPriceIncrease: false,
      }),
    );
  });

  it('accepts hasInsuranceContract true without insurer fields', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingInsurer(onboardingId, { hasInsuranceContract: true }, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        hasInsuranceContract: true,
      }),
    );
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );

    await expect(
      updateCarOnboardingInsurer(
        onboardingId,
        {
          hasInsuranceContract: true,
          insurer: { id: insurerId },
          insurerContractStartedAt: '2020-01-15',
        },
        otherUser,
      ),
    ).rejects.toThrow(CarOnboardingForbiddenError);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        insurerStatus: CarOnboardingInsurerStatus.TODO,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(
      updateCarOnboardingInsurer(
        onboardingId,
        {
          hasInsuranceContract: true,
          insurer: { id: insurerId },
          insurerContractStartedAt: '2020-01-15',
        },
        owner,
      ),
    ).rejects.toThrow(CarOnboardingLockedError);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('allows update when insurer status is ready', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.READY }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingInsurer(
      onboardingId,
      {
        hasInsuranceContract: true,
        insurer: { id: insurerId },
        insurerContractStartedAt: '2020-01-15',
      },
      owner,
    );

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalled();
  });

  it('allows purchased cars without insurance to opt into existing insurance', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        isPurchased: true,
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      }),
    );

    await updateCarOnboardingInsurer(
      onboardingId,
      {
        hasInsuranceContract: true,
        insurer: { id: insurerId },
        insurerContractStartedAt: '2020-01-15',
      },
      owner,
    );

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        hasInsuranceContract: true,
        insurer: expect.objectContaining({ id: insurerId }),
        insurerContractStartedAt: new Date('2020-01-15'),
      }),
    );
  });

  it('persists insurerAnnouncedPriceIncrease for recent contracts', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, insurerStatus: CarOnboardingInsurerStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await updateCarOnboardingInsurer(
      onboardingId,
      {
        hasInsuranceContract: true,
        insurer: { id: insurerId },
        insurerContractStartedAt: sixMonthsAgo.toISOString().slice(0, 10),
        insurerAnnouncedPriceIncrease: true,
      },
      owner,
    );

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        insurerAnnouncedPriceIncrease: true,
      }),
    );
  });

  it('clears shareStartDate when insurance contract start date changes', async () => {
    const shareStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        hasInsuranceContract: true,
        insurer: { id: insurerId },
        insurerStatus: CarOnboardingInsurerStatus.READY,
        insurerContractStartedAt: new Date('2020-01-15'),
        shareStartDate,
      }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingInsurer(
      onboardingId,
      {
        hasInsuranceContract: true,
        insurer: { id: insurerId },
        insurerContractStartedAt: '2021-06-01',
      },
      owner,
    );

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        shareStartDate: null,
        insurerContractStartedAt: new Date('2021-06-01'),
      }),
    );
  });
});
