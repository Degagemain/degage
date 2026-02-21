import { CarTaxFlatRate } from '@/domain/car-tax-flat-rate.model';
import { CarTaxFlatRateFilter } from '@/domain/car-tax-flat-rate.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTaxFlatRateToDomain } from './car-tax-flat-rate.mappers';

export const filterToQuery = (filter: CarTaxFlatRateFilter): Prisma.CarTaxFlatRateWhereInput => {
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

export const dbCarTaxFlatRateSearch = async (filter: CarTaxFlatRateFilter): Promise<Page<CarTaxFlatRate>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carTaxFlatRate.count({ where: whereClause });
  const rows = await prisma.carTaxFlatRate.findMany({
    where: whereClause,
    include: { fiscalRegion: { include: { translations: true } } },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: rows.map((row) => dbCarTaxFlatRateToDomain(row, locale)),
    total,
  };
};
