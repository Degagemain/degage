import { DocumentType, assertRegistrationCertificateUpload } from '@/domain/document.model';
import type { CarOnboarding } from '@/domain/car-onboarding.model';
import type { RegistrationCertificateAnalysis } from '@/domain/registration-certificate-analysis.model';
import type { UserWithRole } from '@/domain/role.model';
import { analyzeRegistrationCertificate } from '@/actions/document/analyze-registration-certificate';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
} from '@/actions/car-onboarding/preparation';
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

const isEmptyString = (value: string | null | undefined): boolean => {
  return value === undefined || value === null || value.trim().length === 0;
};

const buildPrefillPatch = (
  onboarding: CarOnboarding,
  analysis: RegistrationCertificateAnalysis,
): Partial<Pick<CarOnboarding, 'vin' | 'plate' | 'firstRegisteredAt'>> => {
  const patch: Partial<Pick<CarOnboarding, 'vin' | 'plate' | 'firstRegisteredAt'>> = {};

  if (!isEmptyString(analysis.vin)) {
    patch.vin = analysis.vin!.trim();
  }
  if (!isEmptyString(analysis.plate)) {
    patch.plate = analysis.plate!.trim();
  }
  if (analysis.firstRegisteredAt != null) {
    patch.firstRegisteredAt = analysis.firstRegisteredAt;
  }

  return patch;
};

const assertRegistrationCertificateAnalysis = (analysis: RegistrationCertificateAnalysis, side: RegistrationCertificateSide): void => {
  if (!analysis.isRegistrationDocument || analysis.side !== side) {
    throw new DocumentNotRecognizedError(DocumentType.REGISTRATION_CERTIFICATE);
  }
};

const persistDocument = async (
  linkedDocument: { id: string } | null | undefined,
  file: RegistrationCertificateUploadFile,
): Promise<{ id: string }> => {
  if (linkedDocument?.id) {
    await updateDocumentWithUpload({
      documentId: linkedDocument.id,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });
    return { id: linkedDocument.id };
  }

  const created = await createDocumentWithUpload({
    type: DocumentType.REGISTRATION_CERTIFICATE,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    body: file.body,
  });

  return { id: created.id! };
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
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  assertRegistrationCertificateUpload(file.contentType, file.sizeBytes);

  const linkedDocument = getExistingDocument(existing, side);
  const analysis = await analyzeRegistrationCertificate({ body: file.body, contentType: file.contentType });
  assertRegistrationCertificateAnalysis(analysis, side);

  const persisted = await persistDocument(linkedDocument, file);

  if (side === 'front') {
    const prefillPatch = buildPrefillPatch(existing, analysis);
    const documentLinkPatch = linkedDocument?.id == null ? { registrationCertificateFront: { id: persisted.id } } : {};
    const hasChanges = Object.keys(documentLinkPatch).length > 0 || Object.keys(prefillPatch).length > 0;

    if (!hasChanges) {
      return;
    }

    await saveCarOnboardingWithPreparationCheck({
      ...existing,
      ...documentLinkPatch,
      ...prefillPatch,
    });
    return;
  }

  if (linkedDocument?.id) {
    return;
  }

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    registrationCertificateBack: { id: persisted.id },
  });
};
