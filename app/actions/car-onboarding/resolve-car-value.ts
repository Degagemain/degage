import { CarOnboardingCarValueStatus, carOnboardingCarValueResolveInputSchema } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
  assertCarValueStatusIsProposal,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const resolveCarOnboardingCarValue = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarValueStatusIsProposal(existing);
  carOnboardingCarValueResolveInputSchema.parse(body);
  const merged = {
    ...existing,
    carValueStatus: CarOnboardingCarValueStatus.RESOLVED,
  };
  await saveCarOnboardingWithPreparationCheck(merged);
};
