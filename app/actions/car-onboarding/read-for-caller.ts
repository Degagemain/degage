import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { type CarOnboardingCaller, claimCarOnboardingFromSimulation } from '@/actions/car-onboarding/claim-from-simulation';
import { assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';

export const readCarOnboardingForCaller = async (id: string, caller: CarOnboardingCaller) => {
  const onboarding = await readCarOnboarding(id);
  if (await claimCarOnboardingFromSimulation(onboarding, caller)) {
    return readCarOnboarding(id);
  }
  assertCarOnboardingPartialUpdateAllowed(onboarding, caller);
  return onboarding;
};

export { CarOnboardingForbiddenError };
