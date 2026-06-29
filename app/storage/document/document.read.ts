import { Document } from '@/domain/document.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentToDomain } from './document.mappers';

export const dbDocumentRead = async (id: string): Promise<Document> => {
  const prisma = getPrismaClient();
  const document = await prisma.document.findUniqueOrThrow({
    where: { id },
  });
  return dbDocumentToDomain(document);
};
