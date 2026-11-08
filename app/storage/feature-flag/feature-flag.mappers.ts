import { FeatureFlag } from '@/domain/feature-flag.model';
import { Prisma } from '@/storage/client/client';

export const dbFeatureFlagToDomain = (flag: Prisma.FeatureFlagGetPayload<object>): FeatureFlag => ({
  id: flag.id,
  code: flag.code,
  description: flag.description,
  enabled: flag.enabled,
  createdAt: flag.createdAt,
  updatedAt: flag.updatedAt,
});
