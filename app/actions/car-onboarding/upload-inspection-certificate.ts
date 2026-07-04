import { DocumentType, assertRegistrationCertificateUpload } from '@/domain/document.model';
import type { UserWithRole } from '@/domain/role.model';
import { analyzeInspectionCertificate } from '@/actions/document/analyze-inspection-certificate';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { assertCarOnboardingNotLocked, assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export type InspectionCertificateUploadFile = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  body: Buffer;
};

export const uploadCarOnboardingInspectionCertificate = async (
  id: string,
  file: InspectionCertificateUploadFile,
  user: UserWithRole,
): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertRegistrationCertificateUpload(file.contentType, file.sizeBytes);

  const analysis = await analyzeInspectionCertificate({ body: file.body, contentType: file.contentType });
  if (!analysis.isInspectionCertificate) {
    throw new DocumentNotRecognizedError(DocumentType.INSPECTION_CERTIFICATE);
  }

  const linkedDocument = existing.inspectionCertificate;

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
    type: DocumentType.INSPECTION_CERTIFICATE,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    body: file.body,
  });

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    inspectionCertificate: { id: created.id! },
  });
};
