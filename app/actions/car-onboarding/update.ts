import * as z from 'zod';
import { assertCarOnboardingCarNameAvailable } from '@/actions/car-onboarding/assert-car-name-available';
import { CarOnboarding, carOnboardingCarNameSchema, carOnboardingSchema } from '@/domain/car-onboarding.model';
import { applyCarValueProposalTransition } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboarding = async (onboarding: CarOnboarding): Promise<CarOnboarding> => {
  const validated = carOnboardingSchema.parse(onboarding);
  z.uuid().parse(validated.id);
  const existing = await readCarOnboarding(validated.id!);
  const withCarValueTransition = applyCarValueProposalTransition(existing, validated);

  if (withCarValueTransition.carName != null && withCarValueTransition.carName.trim() !== '') {
    const parsedName = carOnboardingCarNameSchema.parse(withCarValueTransition.carName);
    const carNameUnchanged = existing.carName != null && existing.carName.toLowerCase() === parsedName.toLowerCase();
    if (!carNameUnchanged) {
      await assertCarOnboardingCarNameAvailable(parsedName, { excludeOnboardingId: validated.id! });
    }
    withCarValueTransition.carName = parsedName;
  } else {
    withCarValueTransition.carName = null;
  }

  return saveCarOnboardingWithPreparationCheck(withCarValueTransition);
};
