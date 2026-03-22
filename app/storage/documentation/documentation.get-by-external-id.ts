import type { Documentation } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationToDomain } from './documentation.mappers';

export const dbDocumentationGetByExternalId = async (externalId: string): Promise<Documentation | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.documentation.findUnique({
    where: { externalId },
    include: { translations: true },
  });
  return row ? dbDocumentationToDomain(row) : null;
};
