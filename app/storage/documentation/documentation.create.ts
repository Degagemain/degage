import type { Documentation } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationToDomain, documentationToDbCreate } from './documentation.mappers';

export const dbDocumentationCreate = async (doc: Documentation): Promise<Documentation> => {
  const prisma = getPrismaClient();
  const created = await prisma.documentation.create({
    data: documentationToDbCreate(doc),
    include: { translations: true },
  });
  return dbDocumentationToDomain(created);
};
