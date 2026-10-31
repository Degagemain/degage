import { FeatureFlag } from '@/domain/feature-flag.model';
import { dbFeatureFlagRead, dbFeatureFlagReadByCode } from '@/storage/feature-flag/feature-flag.read';

export const readFeatureFlag = async (id: string): Promise<FeatureFlag> => {
  return dbFeatureFlagRead(id);
};

export const getFeatureFlagByCode = async (code: string): Promise<FeatureFlag | null> => {
  return dbFeatureFlagReadByCode(code);
};

export const isFeatureFlagEnabled = async (code: string): Promise<boolean> => {
  const flag = await dbFeatureFlagReadByCode(code);
  return flag?.enabled === true;
};
