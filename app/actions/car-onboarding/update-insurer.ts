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
import { dbInsurerRead } from '@/storage/insurer/insurer.read';

export const updateCarOnboardingInsurer = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  const parsed = carOnboardingInsurerInputSchema.parse(body);

  let insurer = parsed.insurer !== undefined ? parsed.insurer : existing.insurer;
  if (parsed.insurer?.id != null) {
    const record = await dbInsurerRead(parsed.insurer.id);
    insurer = {
      id: record.id!,
      name: parsed.insurer.name ?? record.name,
      supportsInstantOnboarding: record.supportsInstantOnboarding,
    };
  }

  const merged = { ...existing, ...parsed, insurer };
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
