import { computeStepState, getStepsForRecord } from './compute-step-state';
import type { CarOnboarding } from '@/domain/car-onboarding.model';
import type { StepDefinition } from './steps-config';
import { STEP_DEFINITIONS } from './steps-config';
import type { StepId } from './types';

export const getOrderedSteps = (onboarding: CarOnboarding): StepDefinition[] => {
  const visibleIds = getStepsForRecord(onboarding);
  return STEP_DEFINITIONS.filter((s) => visibleIds.includes(s.id));
};

export const getNextAccessibleStep = (onboarding: CarOnboarding, currentId: StepId): StepDefinition | null => {
  const ordered = getOrderedSteps(onboarding);
  const index = ordered.findIndex((s) => s.id === currentId);
  if (index === -1) return null;

  for (let i = index + 1; i < ordered.length; i++) {
    const candidate = ordered[i];
    const state = computeStepState(candidate.id, onboarding);
    if (state !== 'blocked') return candidate;
  }

  return null;
};
