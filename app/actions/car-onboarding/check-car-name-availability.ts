import { assertCarOnboardingCarNameAvailable } from '@/actions/car-onboarding/assert-car-name-available';
import { CarOnboardingCarNameTakenError } from '@/actions/car-onboarding/car-onboarding-car-name-taken.error';
import { assertCarOnboardingNotConfirmedForOwner, assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { carOnboardingCarNameSchema } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';

export type CarOnboardingCarNameAvailabilityResult = {
  available: boolean;
};

export const checkCarOnboardingCarNameAvailability = async (
  id: string,
  carName: unknown,
  user: UserWithRole,
): Promise<CarOnboardingCarNameAvailabilityResult> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotConfirmedForOwner(existing, user);

  const validated = carOnboardingCarNameSchema.parse(carName);

  if (existing.carName != null && existing.carName.toLowerCase() === validated.toLowerCase()) {
    return { available: true };
  }

  try {
    await assertCarOnboardingCarNameAvailable(validated, { excludeOnboardingId: id });
    return { available: true };
  } catch (error) {
    if (error instanceof CarOnboardingCarNameTakenError) {
      return { available: false };
    }
    throw error;
  }
};
