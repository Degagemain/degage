import type { DocumentationGroup } from '@/domain/documentation-group.model';
import type { DocumentationGroupFilter } from '@/domain/documentation-group.filter';
import { Page } from '@/domain/page.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { dbDocumentationGroupToDomain } from './documentation-group.mappers';

export const filterToQuery = (filter: DocumentationGroupFilter): Prisma.DocumentationGroupWhereInput => {
  const q = filter.query?.trim();
  return {
    translations: q
      ? {
          some: {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
        }
      : undefined,
  };
};

export const dbDocumentationGroupSearch = async (filter: DocumentationGroupFilter): Promise<Page<DocumentationGroup>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.documentationGroup.count({ where: whereClause });
  const rows = await prisma.documentationGroup.findMany({
    where: whereClause,
    include: { translations: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: rows.map((r) => dbDocumentationGroupToDomain(r, locale)),
    total,
  };
};
