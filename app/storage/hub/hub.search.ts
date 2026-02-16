import { Hub } from '@/domain/hub.model';
import { HubFilter } from '@/domain/hub.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbHubToDomain } from './hub.mappers';

export const filterToQuery = (filter: HubFilter): Prisma.HubWhereInput => {
  const q = filter.query?.trim();
  return {
    name: q ? { contains: q, mode: 'insensitive' } : undefined,
    isDefault: filter.isDefault !== null ? filter.isDefault : undefined,
  };
};

export const dbHubSearch = async (filter: HubFilter): Promise<Page<Hub>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.hub.count({
    where: whereClause,
  });
  const hubs = await prisma.hub.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: hubs.map(dbHubToDomain),
    total,
  };
};
