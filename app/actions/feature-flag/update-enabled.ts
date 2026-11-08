import { FeatureFlag, type FeatureFlagEnabledUpdate, featureFlagEnabledUpdateSchema } from '@/domain/feature-flag.model';
import { dbFeatureFlagUpdateEnabled } from '@/storage/feature-flag/feature-flag.update-enabled';

export const updateFeatureFlagEnabled = async (id: string, payload: unknown): Promise<FeatureFlag> => {
  const update = featureFlagEnabledUpdateSchema.parse(payload) as FeatureFlagEnabledUpdate;
  return dbFeatureFlagUpdateEnabled(id, update.enabled);
};
