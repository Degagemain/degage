import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingRoadAssistancePlanStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { updateCarOnboardingRoadAssistancePlan } from '@/actions/car-onboarding/update-road-assistance-plan';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const otherUser = { id: 'user-2', role: 'user', banned: false };

describe('updateCarOnboardingRoadAssistancePlan', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('merges road assistance plan info and saves with preparation check', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.TODO }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    const body = {
      hasExistingRoadAssistancePlan: true,
      existingRoadAssistancePlanEndDate: '2026-12-31',
      roadAssistancePlanDescription: 'VAB Europa',
    };

    await updateCarOnboardingRoadAssistancePlan(onboardingId, body, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        hasExistingRoadAssistancePlan: true,
        existingRoadAssistancePlanEndDate: new Date(body.existingRoadAssistancePlanEndDate),
        roadAssistancePlanDescription: 'VAB Europa',
      }),
    );
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.TODO }),
    );

    await expect(
      updateCarOnboardingRoadAssistancePlan(
        onboardingId,
        {
          hasExistingRoadAssistancePlan: false,
          roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
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
        roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.TODO,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(
      updateCarOnboardingRoadAssistancePlan(
        onboardingId,
        {
          hasExistingRoadAssistancePlan: false,
          roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
        },
        owner,
      ),
    ).rejects.toThrow(CarOnboardingLockedError);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('allows update when road assistance plan status is ready', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({ id: onboardingId, owner: { id: owner.id }, roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.READY }),
    );
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    await updateCarOnboardingRoadAssistancePlan(
      onboardingId,
      {
        hasExistingRoadAssistancePlan: false,
        roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
      },
      owner,
    );

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalled();
  });
});
