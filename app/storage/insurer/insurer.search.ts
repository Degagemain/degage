import { Insurer } from '@/domain/insurer.model';
import { InsurerFilter } from '@/domain/insurer.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbInsurerToDomain } from './insurer.mappers';

export const filterToQuery = (filter: InsurerFilter): Prisma.InsurerWhereInput => {
  const q = filter.query?.trim();
  return {
    name: q ? { contains: q, mode: 'insensitive' } : undefined,
  };
};

export const dbInsurerSearch = async (filter: InsurerFilter): Promise<Page<Insurer>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.insurer.count({
    where: whereClause,
  });
  const insurers = await prisma.insurer.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: insurers.map(dbInsurerToDomain),
    total,
  };
};
