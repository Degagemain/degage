import type { Documentation } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationToDomain } from './documentation.mappers';

export const dbDocumentationGetByShortLink = async (shortLink: string): Promise<Documentation | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.documentation.findUnique({
    where: { shortLink },
    include: { translations: true, groups: { include: { translations: true } } },
  });
  return row ? dbDocumentationToDomain(row) : null;
};
