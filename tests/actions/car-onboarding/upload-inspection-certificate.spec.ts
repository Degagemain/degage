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

vi.mock('@/actions/document/analyze-inspection-certificate', () => ({
  analyzeInspectionCertificate: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { DocumentType } from '@/domain/document.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { uploadCarOnboardingInspectionCertificate } from '@/actions/car-onboarding/upload-inspection-certificate';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { analyzeInspectionCertificate } from '@/actions/document/analyze-inspection-certificate';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { document } from '../../builders/document.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const file = {
  fileName: 'inspection.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 4,
  body: Buffer.from('data'),
};

describe('uploadCarOnboardingInspectionCertificate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('analyzes before creating and links a document on first upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeInspectionCertificate).mockResolvedValueOnce({ isInspectionCertificate: true });
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(document({ id: 'doc-1' }));

    await uploadCarOnboardingInspectionCertificate(onboardingId, file, owner);

    expect(analyzeInspectionCertificate).toHaveBeenCalledWith({
      body: file.body,
      contentType: file.contentType,
    });
    expect(createDocumentWithUpload).toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        inspectionCertificate: { id: 'doc-1' },
      }),
    );
    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('analyzes before updating an existing document on re-upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        inspectionCertificate: { id: 'doc-1', name: 'inspection.jpg' },
      }),
    );
    vi.mocked(analyzeInspectionCertificate).mockResolvedValueOnce({ isInspectionCertificate: true });

    await uploadCarOnboardingInspectionCertificate(onboardingId, file, owner);

    expect(analyzeInspectionCertificate).toHaveBeenCalled();
    expect(updateDocumentWithUpload).toHaveBeenCalledWith({
      documentId: 'doc-1',
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });
    expect(createDocumentWithUpload).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('does not store when analysis does not recognize an inspection certificate', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        inspectionCertificate: { id: 'doc-1', name: 'inspection.jpg' },
      }),
    );
    vi.mocked(analyzeInspectionCertificate).mockResolvedValueOnce({ isInspectionCertificate: false });

    await expect(uploadCarOnboardingInspectionCertificate(onboardingId, file, owner)).rejects.toThrow(
      new DocumentNotRecognizedError(DocumentType.INSPECTION_CERTIFICATE),
    );

    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
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

    await expect(uploadCarOnboardingInspectionCertificate(onboardingId, file, owner)).rejects.toThrow(CarOnboardingLockedError);
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: 'other-user' } }));

    await expect(uploadCarOnboardingInspectionCertificate(onboardingId, file, { id: 'user-2', role: 'user', banned: false })).rejects.toThrow(
      CarOnboardingForbiddenError,
    );
  });
});
