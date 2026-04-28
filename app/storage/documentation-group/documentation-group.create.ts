import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationGroupToDomain, documentationGroupToDbCreate } from './documentation-group.mappers';

export const dbDocumentationGroupCreate = async (group: DocumentationGroup): Promise<DocumentationGroup> => {
  const prisma = getPrismaClient();
  const created = await prisma.documentationGroup.create({
    data: documentationGroupToDbCreate(group),
    include: { translations: true },
  });
  return dbDocumentationGroupToDomain(created, getRequestContentLocale());
};
