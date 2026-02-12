import { EuroNorm } from '@/domain/euro-norm.model';
import { EuroNormFilter } from '@/domain/euro-norm.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbEuroNormToDomain } from './euro-norm.mappers';

export const filterToQuery = (filter: EuroNormFilter): Prisma.EuroNormWhereInput => {
  const q = filter.query?.trim();
  return {
    isActive: filter.isActive !== null ? filter.isActive : undefined,
    OR: q ? [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] : undefined,
  };
};

export const dbEuroNormSearch = async (filter: EuroNormFilter): Promise<Page<EuroNorm>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.euroNorm.count({
    where: whereClause,
  });
  const euroNorms = await prisma.euroNorm.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: euroNorms.map(dbEuroNormToDomain),
    total,
  };
};
