import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { CarPriceEstimateFilter } from '@/domain/car-price-estimate.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbCarPriceEstimateToDomainWithRelations } from './car-price-estimate.mappers';

export const filterToQuery = (filter: CarPriceEstimateFilter): Prisma.CarPriceEstimateWhereInput => {
  return {
    carTypeId: filter.carTypeId ?? undefined,
  };
};

export const dbCarPriceEstimateSearch = async (filter: CarPriceEstimateFilter): Promise<Page<CarPriceEstimate>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carPriceEstimate.count({ where: whereClause });
  const records = await prisma.carPriceEstimate.findMany({
    where: whereClause,
    include: { carType: { include: { brand: { include: { translations: true } } } } },
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });
  return {
    records: records.map(dbCarPriceEstimateToDomainWithRelations),
    total,
  };
};
