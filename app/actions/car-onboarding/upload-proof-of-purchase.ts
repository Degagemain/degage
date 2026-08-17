import { DocumentType, assertRegistrationCertificateUpload } from '@/domain/document.model';
import type { UserWithRole } from '@/domain/role.model';
import { analyzeProofOfPurchase } from '@/actions/document/analyze-proof-of-purchase';
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

export type ProofOfPurchaseUploadFile = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  body: Buffer;
};

const isReadablePurchasePrice = (value: number | null): value is number => {
  return value != null && Number.isFinite(value) && value > 0;
};

export const uploadCarOnboardingProofOfPurchase = async (id: string, file: ProofOfPurchaseUploadFile, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);
  assertRegistrationCertificateUpload(file.contentType, file.sizeBytes);

  const analysis = await analyzeProofOfPurchase({ body: file.body, contentType: file.contentType });
  if (!analysis.isProofOfPurchase || !isReadablePurchasePrice(analysis.purchasePriceInclVat)) {
    throw new DocumentNotRecognizedError(DocumentType.PROOF_OF_PURCHASE);
  }

  const linkedDocument = existing.proofOfPurchase;

  if (linkedDocument?.id) {
    await updateDocumentWithUpload({
      documentId: linkedDocument.id,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });
    await saveCarOnboardingWithPreparationCheck({
      ...existing,
      proofOfPurchasePrice: analysis.purchasePriceInclVat,
    });
    return;
  }

  const created = await createDocumentWithUpload({
    type: DocumentType.PROOF_OF_PURCHASE,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    body: file.body,
  });

  await saveCarOnboardingWithPreparationCheck({
    ...existing,
    proofOfPurchase: { id: created.id! },
    proofOfPurchasePrice: analysis.purchasePriceInclVat,
  });
};
