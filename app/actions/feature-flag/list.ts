import { FeatureFlag } from '@/domain/feature-flag.model';
import { FeatureFlagFilter } from '@/domain/feature-flag.filter';
import { Page } from '@/domain/page.model';
import { dbFeatureFlagSearch } from '@/storage/feature-flag/feature-flag.search';

export const searchFeatureFlags = async (filter: FeatureFlagFilter): Promise<Page<FeatureFlag>> => {
  return dbFeatureFlagSearch(filter);
};
