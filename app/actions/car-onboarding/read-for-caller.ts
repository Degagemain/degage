import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';

export const readCarOnboardingForCaller = async (id: string, caller: Parameters<typeof assertCarOnboardingPartialUpdateAllowed>[1]) => {
  const onboarding = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(onboarding, caller);
  return onboarding;
};

export { CarOnboardingForbiddenError };
