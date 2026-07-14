import {
  CarOnboarding,
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInfoSessionStatus,
  isCarInfoSectionComplete,
  isCarStickerSectionComplete,
  isCarValueProposedToOwner,
  isInfoSessionEnrolled,
  isInfoSessionSectionComplete,
  isInsurerSectionComplete,
  isPlayConnectorSectionComplete,
  isRoadAssistancePlanSectionComplete,
  isUserInfoSectionComplete,
} from '@/domain/car-onboarding.model';
import type { StepId, StepState } from './types';

export const getStepsForRecord = (_onboarding: CarOnboarding): StepId[] => {
  return ['play-connector', 'info-session', 'user-info', 'car-info', 'insurer', 'road-assistance-plan', 'car-value', 'car-stickers'];
};

const hasInfoSessionPrerequisites = (onboarding: CarOnboarding): boolean => {
  return isPlayConnectorSectionComplete(onboarding) && isInfoSessionEnrolled(onboarding);
};

export const arePrerequisitesMet = (stepId: StepId, onboarding: CarOnboarding): boolean => {
  if (stepId === 'play-connector') return true;
  if (stepId === 'info-session') return isPlayConnectorSectionComplete(onboarding);
  if (
    stepId === 'user-info' ||
    stepId === 'car-info' ||
    stepId === 'insurer' ||
    stepId === 'road-assistance-plan' ||
    stepId === 'car-value' ||
    stepId === 'car-stickers'
  ) {
    return hasInfoSessionPrerequisites(onboarding);
  }
  return false;
};

export const isStepComplete = (stepId: StepId, onboarding: CarOnboarding): boolean => {
  switch (stepId) {
    case 'play-connector':
      return isPlayConnectorSectionComplete(onboarding);
    case 'info-session':
      return isInfoSessionSectionComplete(onboarding);
    case 'user-info':
      return isUserInfoSectionComplete(onboarding);
    case 'car-info':
      return isCarInfoSectionComplete(onboarding);
    case 'insurer':
      return isInsurerSectionComplete(onboarding);
    case 'road-assistance-plan':
      return isRoadAssistancePlanSectionComplete(onboarding);
    case 'car-value':
      return onboarding.isPurchased || onboarding.carValueStatus === CarOnboardingCarValueStatus.RESOLVED;
    case 'car-stickers':
      return isCarStickerSectionComplete(onboarding);
    default:
      return false;
  }
};

export const computeStepState = (stepId: StepId, onboarding: CarOnboarding): StepState => {
  if (isStepComplete(stepId, onboarding)) return 'done';
  if (!arePrerequisitesMet(stepId, onboarding)) return 'blocked';

  if (stepId === 'info-session') {
    if (onboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.ENROLLED) return 'pending';
    return 'todo';
  }

  if (stepId === 'car-value') {
    switch (onboarding.carValueStatus) {
      case CarOnboardingCarValueStatus.TODO:
        return isCarValueProposedToOwner(onboarding) ? 'todo' : 'pending';
      case CarOnboardingCarValueStatus.PROPOSAL:
        return 'todo';
      case CarOnboardingCarValueStatus.COUNTER:
        return 'pending';
      case CarOnboardingCarValueStatus.RESOLVED:
        return 'done';
    }
  }

  return 'todo';
};

export const isStepReadOnly = (stepId: StepId, onboarding: CarOnboarding): boolean => {
  if (onboarding.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED) return true;

  if (stepId === 'play-connector' && isPlayConnectorSectionComplete(onboarding)) {
    return true;
  }

  if (stepId === 'info-session' && isInfoSessionSectionComplete(onboarding)) {
    return true;
  }

  if (stepId === 'car-value') {
    if (onboarding.isPurchased) return true;
    if (onboarding.carValueStatus === CarOnboardingCarValueStatus.COUNTER) return true;
    if (onboarding.carValueStatus === CarOnboardingCarValueStatus.RESOLVED) return true;
    if (onboarding.carValueStatus === CarOnboardingCarValueStatus.TODO && !isCarValueProposedToOwner(onboarding)) {
      return true;
    }
    return false;
  }

  return false;
};
