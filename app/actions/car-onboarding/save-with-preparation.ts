import { CarOnboarding, applyInsurerStatus } from '@/domain/car-onboarding.model';
import { applyPreparationStatus } from '@/actions/car-onboarding/preparation';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';

export const saveCarOnboardingWithPreparationCheck = async (onboarding: CarOnboarding): Promise<CarOnboarding> => {
  const withInsurer = applyInsurerStatus(onboarding);
  const withStatus = applyPreparationStatus(withInsurer);
  return dbCarOnboardingUpdate(withStatus);
};
