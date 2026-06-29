import { buildDocumentObjectKey } from '@/domain/document.model';
import { dbDocumentRead } from '@/storage/document/document.read';
import { dbDocumentUpdate } from '@/storage/document/document.update';
import { deleteObject, putObject } from '@/integrations/gcs';

export type UpdateDocumentWithUploadInput = {
  documentId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  body: Buffer;
};

export const updateDocumentWithUpload = async (input: UpdateDocumentWithUploadInput) => {
  const existing = await dbDocumentRead(input.documentId);
  const previousSnapshot = { ...existing };
  const objectKey = buildDocumentObjectKey(existing.type, existing.id!, input.fileName);

  const updated = await dbDocumentUpdate({
    ...existing,
    fileName: input.fileName,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    objectKey,
  });

  try {
    await putObject({
      objectKey: updated.objectKey,
      body: input.body,
      contentType: input.contentType,
    });
  } catch (error) {
    await dbDocumentUpdate(previousSnapshot);
    throw error;
  }

  if (previousSnapshot.objectKey !== updated.objectKey) {
    await deleteObject(previousSnapshot.objectKey);
  }

  return updated;
};
