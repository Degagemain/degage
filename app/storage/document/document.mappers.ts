import { Document, DocumentType } from '@/domain/document.model';
import { Prisma } from '@/storage/client/client';

const mapDocumentTypeFromDb = (value: string): DocumentType => {
  return value as DocumentType;
};

export const dbDocumentToDomain = (document: Prisma.DocumentGetPayload<object>): Document => {
  return {
    id: document.id,
    type: mapDocumentTypeFromDb(document.type),
    objectKey: document.objectKey,
    fileName: document.fileName,
    contentType: document.contentType,
    sizeBytes: document.sizeBytes,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
};

export const documentToDbCreate = (document: Document): Prisma.DocumentCreateInput => {
  return {
    id: document.id ?? undefined,
    type: document.type,
    objectKey: document.objectKey,
    fileName: document.fileName,
    contentType: document.contentType,
    sizeBytes: document.sizeBytes,
  };
};

export const documentToDbUpdate = (document: Document): Prisma.DocumentUpdateInput => {
  return {
    type: document.type,
    objectKey: document.objectKey,
    fileName: document.fileName,
    contentType: document.contentType,
    sizeBytes: document.sizeBytes,
  };
};
