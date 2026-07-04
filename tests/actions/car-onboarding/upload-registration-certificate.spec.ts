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

vi.mock('@/actions/document/analyze-registration-certificate', () => ({
  analyzeRegistrationCertificate: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { DocumentType } from '@/domain/document.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { uploadCarOnboardingRegistrationCertificate } from '@/actions/car-onboarding/upload-registration-certificate';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { analyzeRegistrationCertificate } from '@/actions/document/analyze-registration-certificate';
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

const frontAnalysis = {
  isRegistrationDocument: true,
  side: 'front' as const,
  vin: 'WVWZZZ3CZWE123456',
  plate: '1-ABC-123',
  firstRegisteredAt: new Date('2020-03-15'),
  ownerName: 'Jane Doe',
  ownerStreet: 'Main Street 1',
  ownerZip: 1000,
  ownerCity: 'Brussels',
};

const backAnalysis = {
  isRegistrationDocument: true,
  side: 'back' as const,
  vin: null,
  plate: null,
  firstRegisteredAt: null,
  ownerName: null,
  ownerStreet: null,
  ownerZip: null,
  ownerCity: null,
};

describe('uploadCarOnboardingRegistrationCertificate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('analyzes before creating and links a document on first front upload and prefills empty fields', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce(frontAnalysis);
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(document({ id: 'doc-1' }));

    await uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner);

    expect(analyzeRegistrationCertificate).toHaveBeenCalledWith({
      body: file.body,
      contentType: file.contentType,
    });
    expect(createDocumentWithUpload).toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationCertificateFront: { id: 'doc-1' },
        vin: 'WVWZZZ3CZWE123456',
        plate: '1-ABC-123',
        firstRegisteredAt: new Date('2020-03-15'),
      }),
    );
    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('analyzes before updating an existing front document and prefills on re-upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        registrationCertificateFront: { id: 'doc-1', name: 'front.jpg' },
      }),
    );
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce(frontAnalysis);

    await uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner);

    expect(analyzeRegistrationCertificate).toHaveBeenCalled();
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
        vin: 'WVWZZZ3CZWE123456',
        plate: '1-ABC-123',
        firstRegisteredAt: new Date('2020-03-15'),
      }),
    );
  });

  it('does not store when front analysis does not recognize a registration document on re-upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: owner.id },
        registrationCertificateFront: { id: 'doc-1', name: 'front.jpg' },
        vin: 'EXISTING-VIN',
        plate: 'EXISTING-PLATE',
        firstRegisteredAt: new Date('2019-01-01'),
      }),
    );
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce({
      isRegistrationDocument: false,
      side: null,
      vin: null,
      plate: null,
      firstRegisteredAt: null,
      ownerName: null,
      ownerStreet: null,
      ownerZip: null,
      ownerCity: null,
    });

    await expect(uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner)).rejects.toThrow(DocumentNotRecognizedError);

    expect(updateDocumentWithUpload).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('does not store when front analysis does not recognize a registration document on first upload', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce({
      isRegistrationDocument: false,
      side: null,
      vin: null,
      plate: null,
      firstRegisteredAt: null,
      ownerName: null,
      ownerStreet: null,
      ownerZip: null,
      ownerCity: null,
    });

    await expect(uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner)).rejects.toThrow(DocumentNotRecognizedError);

    expect(createDocumentWithUpload).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('does not store when front analysis detects the back side', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce(backAnalysis);

    await expect(uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner)).rejects.toThrow(
      new DocumentNotRecognizedError(DocumentType.REGISTRATION_CERTIFICATE),
    );

    expect(createDocumentWithUpload).not.toHaveBeenCalled();
  });

  it('analyzes before creating back document and requires back side', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce(backAnalysis);
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(document({ id: 'doc-back' }));

    await uploadCarOnboardingRegistrationCertificate(onboardingId, 'back', file, owner);

    expect(analyzeRegistrationCertificate).toHaveBeenCalled();
    expect(createDocumentWithUpload).toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationCertificateBack: { id: 'doc-back' },
      }),
    );
  });

  it('does not store when back analysis detects the front side', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: owner.id } }));
    vi.mocked(analyzeRegistrationCertificate).mockResolvedValueOnce(frontAnalysis);

    await expect(uploadCarOnboardingRegistrationCertificate(onboardingId, 'back', file, owner)).rejects.toThrow(DocumentNotRecognizedError);

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

    await expect(uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, owner)).rejects.toThrow(CarOnboardingLockedError);
  });

  it('throws when user is not the owner', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: onboardingId, owner: { id: 'other-user' } }));

    await expect(
      uploadCarOnboardingRegistrationCertificate(onboardingId, 'front', file, { id: 'user-2', role: 'user', banned: false }),
    ).rejects.toThrow(CarOnboardingForbiddenError);
  });
});
