import { DocumentType } from '@/domain/document.model';
import { dbDocumentCreate } from '@/storage/document/document.create';
import { dbDocumentDelete } from '@/storage/document/document.delete';
import { putObject } from '@/integrations/gcs';

export type CreateDocumentWithUploadInput = {
  type: DocumentType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  body: Buffer;
};

export const createDocumentWithUpload = async (input: CreateDocumentWithUploadInput) => {
  const document = await dbDocumentCreate({
    id: null,
    type: input.type,
    objectKey: '',
    fileName: input.fileName,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    createdAt: null,
    updatedAt: null,
  });

  try {
    await putObject({
      objectKey: document.objectKey,
      body: input.body,
      contentType: input.contentType,
    });
  } catch (error) {
    await dbDocumentDelete(document.id!);
    throw error;
  }

  return document;
};
