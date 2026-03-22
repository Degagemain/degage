import type { Documentation } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationToDomain, documentationToDbUpdate } from './documentation.mappers';

export const dbDocumentationUpdate = async (doc: Documentation): Promise<Documentation> => {
  const prisma = getPrismaClient();
  if (!doc.id) {
    throw new Error('Documentation id is required for update');
  }
  const updated = await prisma.documentation.update({
    where: { id: doc.id },
    data: documentationToDbUpdate(doc),
    include: { translations: true },
  });
  return dbDocumentationToDomain(updated);
};
