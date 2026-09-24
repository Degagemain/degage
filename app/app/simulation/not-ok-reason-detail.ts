import { type SimulationStep, SimulationStepCode, SimulationStepIcon } from '@/domain/simulation.model';

const NOT_OK_REASON_DETAIL_KEY = {
  [SimulationStepCode.MILEAGE_LIMIT]: 'result.notOkReasonDetailMileage',
  [SimulationStepCode.CAR_LIMIT]: 'result.notOkReasonDetailAge',
  [SimulationStepCode.PRICE_CRITERIA_NOT_MET]: 'result.notOkReasonDetailPrice',
  [SimulationStepCode.QUALITY_CRITERIA_NOT_MET]: 'result.notOkReasonDetailQuality',
} as const;

export type NotOkReasonDetailKey = (typeof NOT_OK_REASON_DETAIL_KEY)[keyof typeof NOT_OK_REASON_DETAIL_KEY] | 'result.notOkReasonDetail';

export function notOkReasonDetailKey(steps: SimulationStep[]): NotOkReasonDetailKey {
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    if (step?.status !== SimulationStepIcon.NOT_OK) continue;
    if (step.code == null) return 'result.notOkReasonDetail';
    return NOT_OK_REASON_DETAIL_KEY[step.code as keyof typeof NOT_OK_REASON_DETAIL_KEY] ?? 'result.notOkReasonDetail';
  }
  return 'result.notOkReasonDetail';
}
