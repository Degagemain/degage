import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import type { UserWithRole } from '@/domain/role.model';
import { assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import type { RegistrationCertificateSide } from '@/actions/car-onboarding/registration-certificate-side';
import { RegistrationCertificateNotFoundError } from '@/actions/car-onboarding/registration-certificate-not-found.error';

const getLinkedDocumentId = (onboarding: Awaited<ReturnType<typeof readCarOnboarding>>, side: RegistrationCertificateSide): string | null => {
  const document = side === 'front' ? onboarding.registrationCertificateFront : onboarding.registrationCertificateBack;
  return document?.id ?? null;
};

export const getCarOnboardingRegistrationCertificateViewUrl = async (
  id: string,
  side: RegistrationCertificateSide,
  user: UserWithRole,
): Promise<string> => {
  const onboarding = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(onboarding, user);
  const documentId = getLinkedDocumentId(onboarding, side);
  if (documentId == null) {
    throw new RegistrationCertificateNotFoundError();
  }
  return dbDocumentGetSignedViewUrl(documentId);
};
