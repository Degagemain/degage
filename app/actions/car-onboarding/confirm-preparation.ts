import { isPreparationConfirmable, isPreparationConfirmed } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { CarOnboardingNotConfirmableError } from '@/actions/car-onboarding/car-onboarding-not-confirmable.error';
import { assertCarOnboardingNotLocked, assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const confirmCarOnboardingPreparation = async (id: string, caller: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, caller);
  assertCarOnboardingNotLocked(existing);

  if (isPreparationConfirmed(existing)) {
    return;
  }

  if (!isPreparationConfirmable(existing)) {
    throw new CarOnboardingNotConfirmableError();
  }

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    preparationConfirmedAt: new Date(),
  });
};
