import type { Documentation } from '@/domain/documentation.model';
import type { DocumentationFilter } from '@/domain/documentation.filter';
import { Page } from '@/domain/page.model';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { dbDocumentationToDomain } from './documentation.mappers';

export const filterToQuery = (filter: DocumentationFilter): Prisma.DocumentationWhereInput => {
  const q = filter.query?.trim();
  const translationSearch: Prisma.DocumentationTranslationListRelationFilter | undefined = q
    ? {
        some: {
          OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }],
        },
      }
    : undefined;

  const tagsFilter =
    filter.tags && filter.tags.length > 0
      ? {
          hasEvery: filter.tags,
        }
      : undefined;

  const groupIdsFilter =
    filter.groupIds && filter.groupIds.length > 0
      ? {
          some: {
            id: filter.groupIds.length === 1 ? filter.groupIds[0]! : { in: filter.groupIds },
          },
        }
      : undefined;

  const parts: Prisma.DocumentationWhereInput[] = [];
  if (filter.audiences && filter.audiences.length > 0) {
    parts.push({
      audienceRoles: { hasSome: filter.audiences },
    });
  }

  const core: Prisma.DocumentationWhereInput = {};
  if (filter.isFaq !== null) core.isFaq = filter.isFaq;
  if (filter.isPublic !== null) core.isPublic = filter.isPublic;
  if (filter.sources && filter.sources.length > 0) {
    core.source = filter.sources.length === 1 ? filter.sources[0] : { in: filter.sources };
  }
  if (filter.formats && filter.formats.length > 0) {
    core.format = filter.formats.length === 1 ? filter.formats[0] : { in: filter.formats };
  }
  if (tagsFilter) core.tags = tagsFilter;
  if (groupIdsFilter) core.groups = groupIdsFilter;
  if (translationSearch) core.translations = translationSearch;
  if (Object.keys(core).length > 0) {
    parts.push(core);
  }

  if (parts.length === 0) {
    return {};
  }
  if (parts.length === 1) {
    return parts[0]!;
  }
  return { AND: parts };
};

export const dbDocumentationSearch = async (filter: DocumentationFilter): Promise<Page<Documentation>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.documentation.count({ where: whereClause });
  const rows = await prisma.documentation.findMany({
    where: whereClause,
    include: { translations: true, groups: { include: { translations: true } } },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: rows.map((row) => dbDocumentationToDomain(row)),
    total,
  };
};
