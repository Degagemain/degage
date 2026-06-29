import { randomUUID } from 'node:crypto';

import { Document, buildDocumentObjectKey } from '@/domain/document.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentToDomain, documentToDbCreate } from './document.mappers';

export const dbDocumentCreate = async (document: Document): Promise<Document> => {
  const prisma = getPrismaClient();
  const id = document.id ?? randomUUID();
  const objectKey = document.objectKey || buildDocumentObjectKey(document.type, id, document.fileName);
  const toCreate: Document = {
    ...document,
    id,
    objectKey,
  };
  const created = await prisma.document.create({
    data: documentToDbCreate(toCreate),
  });
  return dbDocumentToDomain(created);
};
