import { CarInfo } from '@/domain/car-info.model';
import { CarInfoFilter } from '@/domain/car-info.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbCarInfoToDomainWithRelations } from './car-info.mappers';

export const filterToQuery = (filter: CarInfoFilter): Prisma.CarInfoWhereInput => {
  return {
    carTypeId: filter.carTypeId ?? undefined,
  };
};

export const dbCarInfoSearch = async (filter: CarInfoFilter): Promise<Page<CarInfo>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carInfo.count({ where: whereClause });
  const records = await prisma.carInfo.findMany({
    where: whereClause,
    include: {
      carType: {
        include: {
          brand: { include: { translations: true } },
          fuelType: { include: { translations: true } },
        },
      },
      euroNorm: true,
    },
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });
  return {
    records: records.map(dbCarInfoToDomainWithRelations),
    total,
  };
};
