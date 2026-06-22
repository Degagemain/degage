import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { assertCarOnboardingPreparationReady } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';

export const startCarOnboarding = async (id: string, caller: UserWithRole): Promise<void> => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const existing = await readCarOnboarding(id);

  if (existing.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED) {
    return;
  }

  assertCarOnboardingPreparationReady(existing);

  await dbCarOnboardingUpdate({
    ...existing,
    statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
  });
};
