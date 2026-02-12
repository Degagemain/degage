import { CarBrand } from '@/domain/car-brand.model';
import { CarBrandFilter } from '@/domain/car-brand.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarBrandToDomain } from './car-brand.mappers';

export const filterToQuery = (filter: CarBrandFilter): Prisma.CarBrandWhereInput => {
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

export const dbCarBrandSearch = async (filter: CarBrandFilter): Promise<Page<CarBrand>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carBrand.count({
    where: whereClause,
  });
  const carBrands = await prisma.carBrand.findMany({
    where: whereClause,
    include: { translations: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: carBrands.map((cb) => dbCarBrandToDomain(cb, locale)),
    total,
  };
};
