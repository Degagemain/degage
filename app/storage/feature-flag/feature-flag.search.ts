import { FeatureFlag } from '@/domain/feature-flag.model';
import { FeatureFlagFilter } from '@/domain/feature-flag.filter';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { dbFeatureFlagToDomain } from './feature-flag.mappers';

export const filterToQuery = (filter: FeatureFlagFilter): Prisma.FeatureFlagWhereInput => {
  return {
    ...(filter.query?.trim()
      ? {
          OR: [
            { code: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { description: { contains: filter.query.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
};

export const dbFeatureFlagSearch = async (filter: FeatureFlagFilter): Promise<Page<FeatureFlag>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.featureFlag.count({
    where: whereClause,
  });
  const flags = await prisma.featureFlag.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });
  return {
    records: flags.map(dbFeatureFlagToDomain),
    total,
  };
};
