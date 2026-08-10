import { assertCarOnboardingCarNameAvailable } from '@/actions/car-onboarding/assert-car-name-available';
import {
  carOnboardingShareStartInputSchema,
  isInsurerSectionComplete,
  isValidShareStartDate,
  startOfMonth,
} from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { CarOnboardingInvalidInsurerStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-insurer-status.error';
import { CarOnboardingInvalidShareStartDateError } from '@/actions/car-onboarding/car-onboarding-invalid-share-start-date.error';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboardingShareStart = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);

  if (!isInsurerSectionComplete(existing)) {
    throw new CarOnboardingInvalidInsurerStatusError('Insurer step must be complete before choosing a share start date');
  }

  const parsed = carOnboardingShareStartInputSchema.parse(body);
  if (parsed.shareStartDate.getDate() !== 1) {
    throw new CarOnboardingInvalidShareStartDateError();
  }

  const shareStartDate = startOfMonth(parsed.shareStartDate);

  if (!isValidShareStartDate(shareStartDate, existing)) {
    throw new CarOnboardingInvalidShareStartDateError();
  }

  const carNameUnchanged = existing.carName != null && existing.carName.toLowerCase() === parsed.carName.toLowerCase();
  if (!carNameUnchanged) {
    await assertCarOnboardingCarNameAvailable(parsed.carName, { excludeOnboardingId: id });
  }

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    shareStartDate,
    carName: parsed.carName,
  });
};
