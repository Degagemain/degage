import { DocumentType, assertRegistrationCertificateUpload } from '@/domain/document.model';
import type { UserWithRole } from '@/domain/role.model';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { assertCarOnboardingNotLocked, assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import type { RegistrationCertificateSide } from '@/actions/car-onboarding/registration-certificate-side';

export type RegistrationCertificateUploadFile = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  body: Buffer;
};

const getExistingDocument = (onboarding: Awaited<ReturnType<typeof readCarOnboarding>>, side: RegistrationCertificateSide) => {
  return side === 'front' ? onboarding.registrationCertificateFront : onboarding.registrationCertificateBack;
};

export const uploadCarOnboardingRegistrationCertificate = async (
  id: string,
  side: RegistrationCertificateSide,
  file: RegistrationCertificateUploadFile,
  user: UserWithRole,
): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertRegistrationCertificateUpload(file.contentType, file.sizeBytes);

  const linkedDocument = getExistingDocument(existing, side);

  if (linkedDocument?.id) {
    await updateDocumentWithUpload({
      documentId: linkedDocument.id,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });
    return;
  }

  const created = await createDocumentWithUpload({
    type: DocumentType.REGISTRATION_CERTIFICATE,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    body: file.body,
  });

  const merged = {
    ...existing,
    ...(side === 'front' ? { registrationCertificateFront: { id: created.id! } } : { registrationCertificateBack: { id: created.id! } }),
  };

  await saveCarOnboardingWithPreparationCheck(merged);
};
