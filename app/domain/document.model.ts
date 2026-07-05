import * as z from 'zod';

import { getMaxUploadFileSizeBytes } from '@/lib/max-upload-file-size';

export enum DocumentType {
  REGISTRATION_CERTIFICATE = 'registrationCertificate',
  INSPECTION_CERTIFICATE = 'inspectionCertificate',
  PINK_FORM = 'pinkForm',
  OTHER = 'other',
}

export const REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png'] as const;

const documentTypeSchema = z.enum(DocumentType);

export const sanitizeDocumentFileName = (fileName: string): string => {
  return fileName.replace(/[/\\]/g, '_').trim();
};

export const buildDocumentObjectKey = (type: DocumentType, documentId: string, fileName: string): string => {
  const sanitized = sanitizeDocumentFileName(fileName);
  return `${type}/${documentId}/${sanitized}`;
};

export const documentSchema = z
  .object({
    id: z.uuid().nullable(),
    type: documentTypeSchema,
    objectKey: z.string().min(1).max(500),
    fileName: z.string().min(1).max(255),
    contentType: z.string().min(1).max(127),
    sizeBytes: z.number().int().min(0),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Document = z.infer<typeof documentSchema>;

export const assertRegistrationCertificateUpload = (contentType: string, sizeBytes: number): void => {
  if (!(REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES as readonly string[]).includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }
  if (sizeBytes <= 0) {
    throw new Error('File is empty');
  }
  const maxSizeBytes = getMaxUploadFileSizeBytes();
  if (sizeBytes > maxSizeBytes) {
    throw new Error(`File exceeds maximum size of ${maxSizeBytes} bytes`);
  }
};
