import { CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
  assertInfoSessionStatusIsEnrolled,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { playConnectorUnenrollInfosession } from '@/play-connector/infosession';

export const unenrollCarOnboardingInfoSession = async (id: string, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  assertInfoSessionStatusIsEnrolled(existing);

  const ownerId = existing.owner?.id;
  const pcId = existing.infoSessionPcId;
  if (ownerId == null || pcId == null) {
    throw new CarOnboardingInvalidInfoSessionStatusError('Info session enrollment data is missing');
  }

  await playConnectorUnenrollInfosession(ownerId, pcId);

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    infoSessionDate: null,
    infoSessionPcId: null,
    infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
  });
};
