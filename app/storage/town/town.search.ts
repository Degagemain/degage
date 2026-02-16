import { Town } from '@/domain/town.model';
import { TownFilter } from '@/domain/town.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbTownToDomainWithRelations } from './town.mappers';

export const filterToQuery = (filter: TownFilter): Prisma.TownWhereInput => {
  const q = filter.query?.trim();
  return {
    ...(q
      ? {
          OR: [
            { zip: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { municipality: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    provinceId: filter.provinceId ?? undefined,
    hubId: filter.hubId ?? undefined,
    highDemand: filter.highDemand !== null ? filter.highDemand : undefined,
    hasActiveMembers: filter.hasActiveMembers !== null ? filter.hasActiveMembers : undefined,
  };
};

export const dbTownSearch = async (filter: TownFilter): Promise<Page<Town>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.town.count({
    where: whereClause,
  });
  const towns = await prisma.town.findMany({
    where: whereClause,
    include: { province: true, hub: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: towns.map(dbTownToDomainWithRelations),
    total,
  };
};
