import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/upload-registration-certificate', () => ({
  uploadCarOnboardingRegistrationCertificate: vi.fn(),
}));

import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import { DocumentType } from '@/domain/document.model';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT as putFront } from '@/api/car-onboardings/[id]/registration-certificate/front/route';
import { PUT as putBack } from '@/api/car-onboardings/[id]/registration-certificate/back/route';
import { auth } from '@/auth';
import { uploadCarOnboardingRegistrationCertificate } from '@/actions/car-onboarding/upload-registration-certificate';

const validId = '550e8400-e29b-41d4-a716-446655440000';
const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

const makeMultipartRequest = () => {
  const bytes = new Uint8Array([1, 2, 3, 4]);
  const file = new File([bytes], 'front.jpg', { type: 'image/jpeg' });
  if (typeof file.arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    });
  }
  const formData = new FormData();
  formData.set('file', file);
  return { formData: vi.fn().mockResolvedValue(formData) } as any;
};

describe('PUT /api/car-onboardings/[id]/registration-certificate/*', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await putFront(makeMultipartRequest(), { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(uploadCarOnboardingRegistrationCertificate).not.toHaveBeenCalled();
  });

  it('returns 204 for front upload', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const response = await putFront(makeMultipartRequest(), { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(uploadCarOnboardingRegistrationCertificate).toHaveBeenCalledWith(
      validId,
      'front',
      expect.objectContaining({
        fileName: 'front.jpg',
        contentType: 'image/jpeg',
        sizeBytes: 4,
      }),
      mockUser,
    );
  });

  it('returns 204 for back upload', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const response = await putBack(makeMultipartRequest(), { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(204);
    expect(uploadCarOnboardingRegistrationCertificate).toHaveBeenCalledWith(validId, 'back', expect.any(Object), mockUser);
  });

  it('returns 400 when front upload is not recognized as a registration certificate', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(uploadCarOnboardingRegistrationCertificate).mockRejectedValueOnce(
      new DocumentNotRecognizedError(DocumentType.REGISTRATION_CERTIFICATE),
    );
    const response = await putFront(makeMultipartRequest(), { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('document_not_recognized');
  });

  it('returns 400 when file field is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const request = { formData: vi.fn().mockResolvedValue(new FormData()) } as any;
    const response = await putFront(request, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('validation_error');
  });
});
