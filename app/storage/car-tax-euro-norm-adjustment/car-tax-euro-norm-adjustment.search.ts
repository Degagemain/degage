import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { CarTaxEuroNormAdjustmentFilter } from '@/domain/car-tax-euro-norm-adjustment.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTaxEuroNormAdjustmentToDomain } from './car-tax-euro-norm-adjustment.mappers';

export const filterToQuery = (filter: CarTaxEuroNormAdjustmentFilter): Prisma.CarTaxEuroNormAdjustmentWhereInput => {
  return {
    ...(filter.query
      ? {
          fiscalRegion: {
            translations: {
              some: {
                name: { contains: filter.query.trim(), mode: 'insensitive' },
              },
            },
          },
        }
      : {}),
    ...(filter.euroNormGroup != null ? { euroNormGroup: filter.euroNormGroup } : {}),
  };
};

export const dbCarTaxEuroNormAdjustmentSearch = async (filter: CarTaxEuroNormAdjustmentFilter): Promise<Page<CarTaxEuroNormAdjustment>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carTaxEuroNormAdjustment.count({
    where: whereClause,
  });
  const rows = await prisma.carTaxEuroNormAdjustment.findMany({
    where: whereClause,
    include: { fiscalRegion: { include: { translations: true } } },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: rows.map((row) => dbCarTaxEuroNormAdjustmentToDomain(row, locale)),
    total,
  };
};
