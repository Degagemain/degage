import { CarOnboarding, applyInsurerStatus, applyRoadAssistancePlanStatus } from '@/domain/car-onboarding.model';
import { applyPreparationStatus } from '@/actions/car-onboarding/preparation';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';

export const saveCarOnboardingWithPreparationCheck = async (onboarding: CarOnboarding): Promise<CarOnboarding> => {
  const withInsurer = applyInsurerStatus(onboarding);
  const withRoadAssistancePlan = applyRoadAssistancePlanStatus(withInsurer);
  const withStatus = applyPreparationStatus(withRoadAssistancePlan);
  return dbCarOnboardingUpdate(withStatus);
};
