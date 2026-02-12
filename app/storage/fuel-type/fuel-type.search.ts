import { FuelType } from '@/domain/fuel-type.model';
import { FuelTypeFilter } from '@/domain/fuel-type.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFuelTypeToDomain } from './fuel-type.mappers';

export const filterToQuery = (filter: FuelTypeFilter): Prisma.FuelTypeWhereInput => {
  return {
    isActive: filter.isActive !== null ? filter.isActive : undefined,
    translations: filter.query
      ? {
          some: {
            name: {
              contains: filter.query.trim(),
              mode: 'insensitive',
            },
          },
        }
      : undefined,
  };
};

export const dbFuelTypeSearch = async (filter: FuelTypeFilter): Promise<Page<FuelType>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.fuelType.count({
    where: whereClause,
  });
  const fuelTypes = await prisma.fuelType.findMany({
    where: whereClause,
    include: { translations: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: fuelTypes.map((ft) => dbFuelTypeToDomain(ft, locale)),
    total,
  };
};
