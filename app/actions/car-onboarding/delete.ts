import { dbCarOnboardingDelete } from '@/storage/car-onboarding/car-onboarding.delete';
import { dbCarOnboardingRead } from '@/storage/car-onboarding/car-onboarding.read';
import { dbDocumentDelete } from '@/storage/document/document.delete';

export const deleteCarOnboarding = async (id: string): Promise<void> => {
  const onboarding = await dbCarOnboardingRead(id);
  const frontId = onboarding.registrationCertificateFront?.id;
  const backId = onboarding.registrationCertificateBack?.id;

  if (frontId) {
    await dbDocumentDelete(frontId);
  }
  if (backId) {
    await dbDocumentDelete(backId);
  }

  await dbCarOnboardingDelete(id);
};
