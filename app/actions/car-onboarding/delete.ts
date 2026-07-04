import { dbCarOnboardingDelete } from '@/storage/car-onboarding/car-onboarding.delete';
import { dbCarOnboardingRead } from '@/storage/car-onboarding/car-onboarding.read';
import { dbDocumentDelete } from '@/storage/document/document.delete';

export const deleteCarOnboarding = async (id: string): Promise<void> => {
  const onboarding = await dbCarOnboardingRead(id);
  const documentIds = [
    onboarding.registrationCertificateFront?.id,
    onboarding.registrationCertificateBack?.id,
    onboarding.inspectionCertificate?.id,
    onboarding.pinkForm?.id,
  ].filter((documentId): documentId is string => documentId != null);

  for (const documentId of documentIds) {
    await dbDocumentDelete(documentId);
  }

  await dbCarOnboardingDelete(id);
};
