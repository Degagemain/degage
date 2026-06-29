import { Document } from '@/domain/document.model';
import { DocumentFilter } from '@/domain/document.filter';
import { Page } from '@/domain/page.model';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { dbDocumentToDomain } from './document.mappers';

export const filterToQuery = (filter: DocumentFilter): Prisma.DocumentWhereInput => {
  const q = filter.query?.trim();
  return {
    type: filter.type !== null ? filter.type : undefined,
    OR: q ? [{ fileName: { contains: q, mode: 'insensitive' } }, { objectKey: { contains: q, mode: 'insensitive' } }] : undefined,
  };
};

export const dbDocumentSearch = async (filter: DocumentFilter): Promise<Page<Document>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.document.count({
    where: whereClause,
  });
  const documents = await prisma.document.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: documents.map(dbDocumentToDomain),
    total,
  };
};
