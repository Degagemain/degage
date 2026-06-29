import { Document } from '@/domain/document.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentToDomain, documentToDbUpdate } from './document.mappers';

export const dbDocumentUpdate = async (document: Document): Promise<Document> => {
  const prisma = getPrismaClient();
  if (document.id == null) {
    throw new Error('Document id is required for update');
  }
  const updated = await prisma.document.update({
    where: { id: document.id },
    data: documentToDbUpdate(document),
  });
  return dbDocumentToDomain(updated);
};
