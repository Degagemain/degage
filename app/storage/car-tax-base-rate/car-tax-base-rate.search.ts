import { CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';
import { CarTaxBaseRateFilter } from '@/domain/car-tax-base-rate.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTaxBaseRateToDomain } from './car-tax-base-rate.mappers';

export const filterToQuery = (filter: CarTaxBaseRateFilter): Prisma.CarTaxBaseRateWhereInput => {
  return {
    fiscalRegion: filter.query
      ? {
          translations: {
            some: {
              name: { contains: filter.query.trim(), mode: 'insensitive' },
            },
          },
        }
      : undefined,
  };
};

export const dbCarTaxBaseRateSearch = async (filter: CarTaxBaseRateFilter): Promise<Page<CarTaxBaseRate>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carTaxBaseRate.count({ where: whereClause });
  const rows = await prisma.carTaxBaseRate.findMany({
    where: whereClause,
    include: { fiscalRegion: { include: { translations: true } } },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: rows.map((row) => dbCarTaxBaseRateToDomain(row, locale)),
    total,
  };
};
