import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import type { UserWithRole } from '@/domain/role.model';
import { assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { InspectionCertificateNotFoundError } from '@/actions/car-onboarding/inspection-certificate-not-found.error';

export const getCarOnboardingInspectionCertificateViewUrl = async (id: string, user: UserWithRole): Promise<string> => {
  const onboarding = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(onboarding, user);
  const documentId = onboarding.inspectionCertificate?.id ?? null;
  if (documentId == null) {
    throw new InspectionCertificateNotFoundError();
  }
  return dbDocumentGetSignedViewUrl(documentId);
};
