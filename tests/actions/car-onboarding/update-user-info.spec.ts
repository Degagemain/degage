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
import { updateCarOnboardingUserInfo } from '@/actions/car-onboarding/update-user-info';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const otherUser = { id: 'user-2', role: 'user', banned: false };

describe('updateCarOnboardingUserInfo', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('merges user info and saves with preparation check', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(completeCarOnboarding({ id: onboardingId }));

    const body = {
      street: 'Main Street 1',
      town: { id: '550e8400-e29b-41d4-a716-446655440099' },
      phone: '+32 470 00 00 00',
    };

    await updateCarOnboardingUserInfo(onboardingId, body, owner);

    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        id: onboardingId,
        street: body.street,
        town: body.town,
        phone: body.phone,
      }),
    );
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));

    await expect(
      updateCarOnboardingUserInfo(
        onboardingId,
        {
          street: 'Main Street 1',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
          phone: '+32 470 00 00 00',
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
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(
      updateCarOnboardingUserInfo(
        onboardingId,
        {
          street: 'Main Street 1',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
          phone: '+32 470 00 00 00',
        },
        owner,
      ),
    ).rejects.toThrow(CarOnboardingLockedError);

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
