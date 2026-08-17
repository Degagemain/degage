import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/read', () => ({
  readCarOnboarding: vi.fn(),
}));

vi.mock('@/actions/document/create-with-upload', () => ({
  createDocumentWithUpload: vi.fn(),
}));

vi.mock('@/actions/document/update-with-upload', () => ({
  updateDocumentWithUpload: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('@/actions/document/analyze-proof-of-purchase', () => ({
  analyzeProofOfPurchase: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { DocumentType } from '@/domain/document.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { uploadCarOnboardingProofOfPurchase } from '@/actions/car-onboarding/upload-proof-of-purchase';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { analyzeProofOfPurchase } from '@/actions/document/analyze-proof-of-purchase';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { document } from '../../builders/document.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const file = {
  fileName: 'proof-of-purchase.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 4,
  body: Buffer.from('data'),
};

describe('uploadCarOnboardingProofOfPurchase', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('analyzes before creating and links a document with the read price on first upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeProofOfPurchase).mockResolvedValueOnce({ isProofOfPurchase: true, purchasePriceInclVat: 24990 });
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(document({ id: 'doc-1' }));

    await uploadCarOnboardingProofOfPurchase(onboardingId, file, owner);

    expect(analyzeProofOfPurchase).toHaveBeenCalledWith({
      body: file.body,
      contentType: file.contentType,
    });
    expect(createDocumentWithUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DocumentType.PROOF_OF_PURCHASE,
      }),
    );
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        proofOfPurchase: { id: 'doc-1' },
        proofOfPurchasePrice: 24990,
      }),
    );
    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('analyzes before updating an existing document and stores the read price', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        proofOfPurchase: { id: 'doc-1', name: 'proof-of-purchase.jpg' },
        proofOfPurchasePrice: 10000,
      }),
    );
    vi.mocked(analyzeProofOfPurchase).mockResolvedValueOnce({ isProofOfPurchase: true, purchasePriceInclVat: 32100.5 });

    await uploadCarOnboardingProofOfPurchase(onboardingId, file, owner);

    expect(analyzeProofOfPurchase).toHaveBeenCalled();
    expect(updateDocumentWithUpload).toHaveBeenCalledWith({
      documentId: 'doc-1',
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });
    expect(createDocumentWithUpload).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        proofOfPurchasePrice: 32100.5,
      }),
    );
  });

  it('does not store when analysis does not recognize a proof of purchase', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeProofOfPurchase).mockResolvedValueOnce({ isProofOfPurchase: false, purchasePriceInclVat: null });

    await expect(uploadCarOnboardingProofOfPurchase(onboardingId, file, owner)).rejects.toThrow(
      new DocumentNotRecognizedError(DocumentType.PROOF_OF_PURCHASE),
    );

    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
    expect(createDocumentWithUpload).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('does not store when the purchase price including VAT is not readable', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeProofOfPurchase).mockResolvedValueOnce({ isProofOfPurchase: true, purchasePriceInclVat: null });

    await expect(uploadCarOnboardingProofOfPurchase(onboardingId, file, owner)).rejects.toThrow(
      new DocumentNotRecognizedError(DocumentType.PROOF_OF_PURCHASE),
    );

    expect(createDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(uploadCarOnboardingProofOfPurchase(onboardingId, file, owner)).rejects.toThrow(CarOnboardingLockedError);
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: 'other-user' } }));

    await expect(uploadCarOnboardingProofOfPurchase(onboardingId, file, { id: 'user-2', role: 'user', banned: false })).rejects.toThrow(
      CarOnboardingForbiddenError,
    );
  });
});
