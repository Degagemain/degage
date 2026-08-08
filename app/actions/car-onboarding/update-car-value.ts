import { CarOnboardingCarValueStatus, carOnboardingCarValueCounterInputSchema } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
  assertCarValueStatusIsProposal,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboardingCarValue = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  assertCarValueStatusIsProposal(existing);
  const parsed = carOnboardingCarValueCounterInputSchema.parse(body);
  const merged = {
    ...existing,
    ...parsed,
    carValueStatus: CarOnboardingCarValueStatus.COUNTER,
  };
  await saveCarOnboardingWithPreparationCheck(merged);
};
