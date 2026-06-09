import { getSubflowDefinition } from './subflows-config';
import type { OnboardingStage, OnboardingVariant, SubflowId } from './types';

const STAGE_RANK: Record<OnboardingStage, number> = {
  preparation: 0,
  in_progress: 1,
  ready_to_share: 2,
};

export function isPreparationSubflowReadOnly(subflowId: SubflowId, variant: OnboardingVariant, currentStage: OnboardingStage): boolean {
  if (variant !== 'regular') return false;
  if (STAGE_RANK[currentStage] <= STAGE_RANK.preparation) return false;
  const definition = getSubflowDefinition(subflowId);
  return definition?.stage === 'preparation';
}
