import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationGroupToDomain, documentationGroupToDbUpdate } from './documentation-group.mappers';

export const dbDocumentationGroupUpdate = async (group: DocumentationGroup): Promise<DocumentationGroup> => {
  const prisma = getPrismaClient();
  if (!group.id) {
    throw new Error('DocumentationGroup id is required for update');
  }
  const updated = await prisma.documentationGroup.update({
    where: { id: group.id },
    data: documentationGroupToDbUpdate(group),
    include: { translations: true },
  });
  return dbDocumentationGroupToDomain(updated, getRequestContentLocale());
};
