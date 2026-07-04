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

vi.mock('@/actions/document/analyze-pink-form', () => ({
  analyzePinkForm: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { DocumentType } from '@/domain/document.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { uploadCarOnboardingPinkForm } from '@/actions/car-onboarding/upload-pink-form';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { analyzePinkForm } from '@/actions/document/analyze-pink-form';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { document } from '../../builders/document.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const file = {
  fileName: 'pink-form.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 4,
  body: Buffer.from('data'),
};

describe('uploadCarOnboardingPinkForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('analyzes before creating and links a document on first upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzePinkForm).mockResolvedValueOnce({ isPinkForm: true });
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(document({ id: 'doc-1' }));

    await uploadCarOnboardingPinkForm(onboardingId, file, owner);

    expect(analyzePinkForm).toHaveBeenCalledWith({
      body: file.body,
      contentType: file.contentType,
    });
    expect(createDocumentWithUpload).toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        pinkForm: { id: 'doc-1' },
      }),
    );
    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('analyzes before updating an existing document on re-upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        pinkForm: { id: 'doc-1', name: 'pink-form.jpg' },
      }),
    );
    vi.mocked(analyzePinkForm).mockResolvedValueOnce({ isPinkForm: true });

    await uploadCarOnboardingPinkForm(onboardingId, file, owner);

    expect(analyzePinkForm).toHaveBeenCalled();
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

  it('does not store when analysis does not recognize a pink form', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        pinkForm: { id: 'doc-1', name: 'pink-form.jpg' },
      }),
    );
    vi.mocked(analyzePinkForm).mockResolvedValueOnce({ isPinkForm: false });

    await expect(uploadCarOnboardingPinkForm(onboardingId, file, owner)).rejects.toThrow(
      new DocumentNotRecognizedError(DocumentType.PINK_FORM),
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

    await expect(uploadCarOnboardingPinkForm(onboardingId, file, owner)).rejects.toThrow(CarOnboardingLockedError);
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: 'other-user' } }));

    await expect(uploadCarOnboardingPinkForm(onboardingId, file, { id: 'user-2', role: 'user', banned: false })).rejects.toThrow(
      CarOnboardingForbiddenError,
    );
  });
});
