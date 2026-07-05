import { describe, expect, it, vi } from 'vitest';
import {
  DocumentType,
  assertRegistrationCertificateUpload,
  buildDocumentObjectKey,
  documentSchema,
  sanitizeDocumentFileName,
} from '@/domain/document.model';

describe('document.model', () => {
  it('builds object keys with document type prefix', () => {
    expect(buildDocumentObjectKey(DocumentType.REGISTRATION_CERTIFICATE, '550e8400-e29b-41d4-a716-446655440000', 'front.jpg')).toBe(
      'registrationCertificate/550e8400-e29b-41d4-a716-446655440000/front.jpg',
    );
    expect(buildDocumentObjectKey(DocumentType.OTHER, '550e8400-e29b-41d4-a716-446655440001', 'invoice.pdf')).toBe(
      'other/550e8400-e29b-41d4-a716-446655440001/invoice.pdf',
    );
  });

  it('sanitizes path separators in file names', () => {
    expect(sanitizeDocumentFileName('foo/bar.jpg')).toBe('foo_bar.jpg');
  });

  it('parses a valid document', () => {
    const result = documentSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: DocumentType.OTHER,
      objectKey: 'other/550e8400-e29b-41d4-a716-446655440000/file.pdf',
      fileName: 'file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects unsupported registration certificate content types', () => {
    expect(() => assertRegistrationCertificateUpload('text/plain', 100)).toThrow('Unsupported content type');
  });

  it('rejects PDF for registration certificate uploads', () => {
    expect(() => assertRegistrationCertificateUpload('application/pdf', 100)).toThrow('Unsupported content type');
  });

  it('rejects oversized registration certificate uploads', () => {
    vi.stubEnv('NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB', '10');
    expect(() => assertRegistrationCertificateUpload('image/jpeg', 11 * 1024 * 1024)).toThrow('File exceeds maximum size');
  });
});
