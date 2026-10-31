import { FeatureFlag } from '@/domain/feature-flag.model';
import { getPrismaClient } from '@/storage/utils';
import { dbFeatureFlagToDomain } from './feature-flag.mappers';

export const dbFeatureFlagRead = async (id: string): Promise<FeatureFlag> => {
  const prisma = getPrismaClient();
  const flag = await prisma.featureFlag.findUniqueOrThrow({
    where: { id },
  });
  return dbFeatureFlagToDomain(flag);
};

export const dbFeatureFlagReadByCode = async (code: string): Promise<FeatureFlag | null> => {
  const prisma = getPrismaClient();
  const flag = await prisma.featureFlag.findUnique({
    where: { code },
  });
  if (!flag) return null;
  return dbFeatureFlagToDomain(flag);
};
