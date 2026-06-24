import { CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { assertCarOnboardingNotLocked, assertInfoSessionStatusIsEnrolled } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const confirmCarOnboardingInfoSession = async (id: string, caller: UserWithRole): Promise<void> => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const existing = await readCarOnboarding(id);
  assertCarOnboardingNotLocked(existing);

  if (existing.infoSessionStatus === CarOnboardingInfoSessionStatus.DONE) {
    return;
  }

  assertInfoSessionStatusIsEnrolled(existing);

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    infoSessionStatus: CarOnboardingInfoSessionStatus.DONE,
  });
};
