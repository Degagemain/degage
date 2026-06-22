import {
  CarOnboarding,
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInsurerStatus,
  isCarInfoSectionComplete,
  isCarValueProposedToOwner,
  isInsurerSectionComplete,
  isPlayConnectorSectionComplete,
  isUserInfoSectionComplete,
} from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingInvalidCarValueStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-car-value-status.error';
import { CarOnboardingInvalidInsurerStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-insurer-status.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { CarOnboardingPreparationNotReadyError } from '@/actions/car-onboarding/car-onboarding-preparation-not-ready.error';
import { isAdmin } from '@/domain/role.utils';
import type { UserWithRole } from '@/domain/role.model';

export const isCarValueSectionComplete = (onboarding: CarOnboarding): boolean => {
  return onboarding.carValueStatus === CarOnboardingCarValueStatus.RESOLVED;
};

export const isPreparationReady = (onboarding: CarOnboarding): boolean => {
  return (
    isPlayConnectorSectionComplete(onboarding) &&
    isCarInfoSectionComplete(onboarding) &&
    isUserInfoSectionComplete(onboarding) &&
    isCarValueSectionComplete(onboarding) &&
    isInsurerSectionComplete(onboarding)
  );
};

export const assertCarOnboardingNotLocked = (onboarding: CarOnboarding): void => {
  if (onboarding.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED) {
    throw new CarOnboardingLockedError();
  }
};

export const assertCarOnboardingPreparationReady = (onboarding: CarOnboarding): void => {
  if (onboarding.statusInPreparation !== CarOnboardingInPreparationStatus.READY || !isPreparationReady(onboarding)) {
    throw new CarOnboardingPreparationNotReadyError();
  }
};

export const assertCarOnboardingPartialUpdateAllowed = (onboarding: CarOnboarding, user: UserWithRole): void => {
  if (isAdmin(user)) return;
  if (onboarding.owner?.id === user.id) return;
  throw new CarOnboardingForbiddenError();
};

export const assertCarValueStatusIsProposal = (onboarding: CarOnboarding): void => {
  if (!isCarValueProposedToOwner(onboarding)) {
    throw new CarOnboardingInvalidCarValueStatusError();
  }
};

export const assertInsurerStatusIsTodo = (onboarding: CarOnboarding): void => {
  if (onboarding.insurerStatus !== CarOnboardingInsurerStatus.TODO) {
    throw new CarOnboardingInvalidInsurerStatusError();
  }
};

export const applyCarValueProposalTransition = (existing: CarOnboarding, updated: CarOnboarding): CarOnboarding => {
  const carValueChanged = updated.carValue !== existing.carValue;
  const statusAllowsTransition =
    existing.carValueStatus === CarOnboardingCarValueStatus.TODO || existing.carValueStatus === CarOnboardingCarValueStatus.COUNTER;

  const canTransition =
    statusAllowsTransition && (carValueChanged || (existing.carValueStatus === CarOnboardingCarValueStatus.TODO && updated.carValue > 0));

  if (!canTransition) {
    return updated;
  }

  return {
    ...updated,
    carValueStatus: CarOnboardingCarValueStatus.PROPOSAL,
  };
};

export const applyPreparationStatus = (onboarding: CarOnboarding): CarOnboarding => {
  if (onboarding.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED) {
    return onboarding;
  }

  return {
    ...onboarding,
    statusInPreparation: isPreparationReady(onboarding) ? CarOnboardingInPreparationStatus.READY : CarOnboardingInPreparationStatus.OPEN,
  };
};
