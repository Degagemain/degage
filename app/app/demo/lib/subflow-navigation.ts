import { computeSubflowState } from './compute-stage';
import { type SubflowDefinition, getSubflowsForVariant } from './subflows-config';
import type { OnboardingStage, OnboardingState, OnboardingVariant, SubflowId } from './types';

export function getOrderedSubflows(variant: OnboardingVariant): SubflowDefinition[] {
  return getSubflowsForVariant(variant);
}

export function getNextAccessibleSubflow(
  variant: OnboardingVariant,
  currentId: SubflowId,
  state: OnboardingState,
  currentStage: OnboardingStage,
): SubflowDefinition | null {
  const ordered = getOrderedSubflows(variant);
  const index = ordered.findIndex((s) => s.id === currentId);
  if (index === -1) return null;

  for (let i = index + 1; i < ordered.length; i++) {
    const candidate = ordered[i];
    const candidateState = computeSubflowState(candidate.id, state, variant, currentStage);
    if (candidateState !== 'blocked') return candidate;
  }

  return null;
}
