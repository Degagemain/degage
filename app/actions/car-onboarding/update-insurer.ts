import {
  CarOnboardingInsurerStatus,
  carOnboardingInsurerInputSchema,
  shouldClearShareStartOnInsurerChange,
} from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboardingInsurer = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  const parsed = carOnboardingInsurerInputSchema.parse(body);
  const merged = { ...existing, ...parsed };
  const withInsurerCompletion =
    merged.isPurchased && !merged.hasInsuranceContract
      ? {
          ...merged,
          insurer: null,
          insurerContractStartedAt: null,
          insurerAnnouncedPriceIncrease: false,
          insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        }
      : merged;

  const withClearedShareStart = shouldClearShareStartOnInsurerChange(existing, withInsurerCompletion)
    ? { ...withInsurerCompletion, shareStartDate: null }
    : withInsurerCompletion;

  await saveCarOnboardingWithPreparationCheck(withClearedShareStart);
};
