import { CarOnboardingInsurerStatus, carOnboardingInsurerInputSchema } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { assertCarOnboardingNotLocked, assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboardingInsurer = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
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
  await saveCarOnboardingWithPreparationCheck(withInsurerCompletion);
};
