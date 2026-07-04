import { DocumentType, assertRegistrationCertificateUpload } from '@/domain/document.model';
import type { CarOnboarding } from '@/domain/car-onboarding.model';
import type { RegistrationCertificateAnalysis } from '@/domain/registration-certificate-analysis.model';
import type { UserWithRole } from '@/domain/role.model';
import { analyzeRegistrationCertificate } from '@/actions/document/analyze-registration-certificate';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { RegistrationCertificateNotRecognizedError } from '@/actions/car-onboarding/registration-certificate-not-recognized.error';
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

const isEmptyString = (value: string | null | undefined): boolean => {
  return value == null || value.trim().length === 0;
};

const buildPrefillPatch = (
  onboarding: CarOnboarding,
  analysis: RegistrationCertificateAnalysis,
): Partial<Pick<CarOnboarding, 'vin' | 'plate' | 'firstRegisteredAt'>> => {
  const patch: Partial<Pick<CarOnboarding, 'vin' | 'plate' | 'firstRegisteredAt'>> = {};

  if (isEmptyString(onboarding.vin) && analysis.vin != null && analysis.vin.trim().length > 0) {
    patch.vin = analysis.vin.trim();
  }
  if (isEmptyString(onboarding.plate) && analysis.plate != null && analysis.plate.trim().length > 0) {
    patch.plate = analysis.plate.trim();
  }
  if (onboarding.firstRegisteredAt == null && analysis.firstRegisteredAt != null) {
    patch.firstRegisteredAt = analysis.firstRegisteredAt;
  }

  return patch;
};

const saveFrontUploadWithAnalysis = async (
  existing: CarOnboarding,
  file: RegistrationCertificateUploadFile,
  documentLinkPatch: Partial<Pick<CarOnboarding, 'registrationCertificateFront'>>,
): Promise<void> => {
  const analysis = await analyzeRegistrationCertificate({ body: file.body, contentType: file.contentType });

  if (!analysis.isRegistrationDocument) {
    throw new RegistrationCertificateNotRecognizedError();
  }

  const prefillPatch = buildPrefillPatch(existing, analysis);
  const hasChanges = Object.keys(documentLinkPatch).length > 0 || Object.keys(prefillPatch).length > 0;

  if (!hasChanges) {
    return;
  }

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    ...documentLinkPatch,
    ...prefillPatch,
  });
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

  if (side === 'front') {
    if (linkedDocument?.id) {
      await updateDocumentWithUpload({
        documentId: linkedDocument.id,
        fileName: file.fileName,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
        body: file.body,
      });
      await saveFrontUploadWithAnalysis(existing, file, {});
      return;
    }

    const created = await createDocumentWithUpload({
      type: DocumentType.REGISTRATION_CERTIFICATE,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });

    await saveFrontUploadWithAnalysis(existing, file, {
      registrationCertificateFront: { id: created.id! },
    });
    return;
  }

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
    registrationCertificateBack: { id: created.id! },
  };

  await saveCarOnboardingWithPreparationCheck(merged);
};
