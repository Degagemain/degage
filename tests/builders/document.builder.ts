import { Document, DocumentType } from '@/domain/document.model';

export const document = (data: Partial<Document> = {}): Document => {
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    type: data.type ?? DocumentType.REGISTRATION_CERTIFICATE,
    objectKey: data.objectKey ?? 'registrationCertificate/550e8400-e29b-41d4-a716-446655440000/front.jpg',
    fileName: data.fileName ?? 'front.jpg',
    contentType: data.contentType ?? 'image/jpeg',
    sizeBytes: data.sizeBytes ?? 1024,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
