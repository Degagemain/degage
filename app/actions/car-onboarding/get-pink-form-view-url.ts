import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import type { UserWithRole } from '@/domain/role.model';
import { assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { PinkFormNotFoundError } from '@/actions/car-onboarding/pink-form-not-found.error';

export const getCarOnboardingPinkFormViewUrl = async (id: string, user: UserWithRole): Promise<string> => {
  const onboarding = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(onboarding, user);
  const documentId = onboarding.pinkForm?.id ?? null;
  if (documentId == null) {
    throw new PinkFormNotFoundError();
  }
  return dbDocumentGetSignedViewUrl(documentId);
};
