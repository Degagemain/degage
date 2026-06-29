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

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { uploadCarOnboardingRegistrationCertificate } from '@/actions/car-onboarding/upload-registration-certificate';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { document } from '../../builders/document.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const owner = { id: 'user-1', role: 'user', banned: false };
const file = {
  fileName: 'front.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 4,
  body: Buffer.from('data'),
};

describe('uploadCarOnboardingRegistrationCertificate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates and links a document on first upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(document({ id: 'doc-1' }));

    await uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner);

    expect(createDocumentWithUpload).toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationCertificateFront: { id: 'doc-1' },
      }),
    );
    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('updates an existing document in place on re-upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        registrationCertificateFront: { id: 'doc-1', name: 'front.jpg' },
      }),
    );

    await uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner);

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

  it('throws when onboarding is locked', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner)).rejects.toThrow(CarOnboardingLockedError);
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: 'other-user' } }));

    await expect(
      uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, { id: 'user-2', role: 'user', banned: false }),
    ).rejects.toThrow(CarOnboardingForbiddenError);
  });
});
