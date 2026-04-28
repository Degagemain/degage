import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationGroupToDomain } from './documentation-group.mappers';

export const dbDocumentationGroupRead = async (id: string): Promise<DocumentationGroup> => {
  const prisma = getPrismaClient();
  const row = await prisma.documentationGroup.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbDocumentationGroupToDomain(row, getRequestContentLocale());
};
