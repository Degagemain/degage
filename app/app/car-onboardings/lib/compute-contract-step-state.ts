import type { CarOnboarding } from '@/domain/car-onboarding.model';
import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { ContractStatus } from '@/domain/contract.model';
import type { StepState } from './types';

export const computeContractStepState = (onboarding: CarOnboarding): StepState => {
  if (onboarding.statusInPreparation !== CarOnboardingInPreparationStatus.LOCKED) {
    return 'blocked';
  }
  if (onboarding.contract == null) {
    return 'blocked';
  }
  if (onboarding.contract.status === ContractStatus.Signed) {
    return 'done';
  }
  if (onboarding.contract.status === ContractStatus.Sent) {
    return 'todo';
  }
  return 'blocked';
};
