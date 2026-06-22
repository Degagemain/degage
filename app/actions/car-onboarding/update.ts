import * as z from 'zod';
import { CarOnboarding, carOnboardingSchema } from '@/domain/car-onboarding.model';
import { applyCarValueProposalTransition } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboarding = async (onboarding: CarOnboarding): Promise<CarOnboarding> => {
  const validated = carOnboardingSchema.parse(onboarding);
  z.uuid().parse(validated.id);
  const existing = await readCarOnboarding(validated.id!);
  const withCarValueTransition = applyCarValueProposalTransition(existing, validated);
  return saveCarOnboardingWithPreparationCheck(withCarValueTransition);
};
