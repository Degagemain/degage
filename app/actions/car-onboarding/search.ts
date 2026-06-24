import { CarOnboardingFilter } from '@/domain/car-onboarding.filter';
import { dbCarOnboardingSearch } from '@/storage/car-onboarding/car-onboarding.search';

export const searchCarOnboardings = async (filter: CarOnboardingFilter) => {
  return dbCarOnboardingSearch(filter);
};
