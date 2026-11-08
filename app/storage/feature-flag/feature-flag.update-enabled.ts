import { FeatureFlag } from '@/domain/feature-flag.model';
import { getPrismaClient } from '@/storage/utils';
import { dbFeatureFlagToDomain } from './feature-flag.mappers';

export const dbFeatureFlagUpdateEnabled = async (id: string, enabled: boolean): Promise<FeatureFlag> => {
  const prisma = getPrismaClient();
  const updated = await prisma.featureFlag.update({
    where: { id },
    data: { enabled },
  });
  return dbFeatureFlagToDomain(updated);
};
