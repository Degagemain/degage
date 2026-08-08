import {
  CarOnboardingInfoSessionStatus,
  carOnboardingInfoSessionEnrollInputSchema,
  isPlayConnectorSectionComplete,
} from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
  assertInfoSessionStatusIsTodo,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { playConnectorEnrollInfosession } from '@/play-connector/infosession';

export const enrollCarOnboardingInfoSession = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  assertInfoSessionStatusIsTodo(existing);

  if (!isPlayConnectorSectionComplete(existing)) {
    throw new CarOnboardingInvalidInfoSessionStatusError('Play connector must be configured before enrolling in an info session');
  }

  const ownerId = existing.owner?.id;
  if (ownerId == null) {
    throw new CarOnboardingInvalidInfoSessionStatusError('Car onboarding has no owner');
  }

  const parsed = carOnboardingInfoSessionEnrollInputSchema.parse(body);

  await playConnectorEnrollInfosession(ownerId, parsed.infoSessionPcId);

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    infoSessionDate: parsed.infoSessionDate,
    infoSessionPcId: parsed.infoSessionPcId,
    infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
  });
};
