import { CarType } from '@/domain/car-type.model';
import { CarTypeFilter } from '@/domain/car-type.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTypeToDomainWithRelations } from './car-type.mappers';

export const filterToQuery = (filter: CarTypeFilter): Prisma.CarTypeWhereInput => {
  return {
    ...(filter.brandIds.length > 0 ? { brandId: { in: filter.brandIds } } : {}),
    ...(filter.fuelTypeIds.length > 0 ? { fuelTypeId: { in: filter.fuelTypeIds } } : {}),
    isActive: filter.isActive !== null ? filter.isActive : undefined,
    name: filter.query
      ? {
          contains: filter.query.trim(),
          mode: 'insensitive',
        }
      : undefined,
  };
};

export const dbCarTypeSearch = async (filter: CarTypeFilter): Promise<Page<CarType>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carType.count({
    where: whereClause,
  });
  const carTypes = await prisma.carType.findMany({
    where: whereClause,
    include: {
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
    },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: carTypes.map((ct) => dbCarTypeToDomainWithRelations(ct, locale)),
    total,
  };
};
