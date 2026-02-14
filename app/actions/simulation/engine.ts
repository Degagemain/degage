import { addYears, isBefore } from 'date-fns';

import {
  SIMULATION_MAX_AGE_YEARS,
  SIMULATION_MAX_KM,
  SimulationResultCode,
  type SimulationRunInput,
  SimulationStep,
  SimulationStepCode,
  SimulationStepStatus,
} from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';
import { carValueEstimator } from './car-value-estimator';

/**
 * Km rule: reject if km > SIMULATION_MAX_KM.
 * Returns the step (code, status, params) and whether to reject.
 */
export function applyKmRule(km: number): {
  code: SimulationStepCode;
  status: SimulationStepStatus;
  params: Record<string, string | number>;
  reject: boolean;
} {
  const params = { maxKm: SIMULATION_MAX_KM };
  if (km > SIMULATION_MAX_KM) {
    return { code: SimulationStepCode.KM_LIMIT, status: SimulationStepStatus.NOT_OK, params, reject: true };
  }
  return { code: SimulationStepCode.KM_LIMIT, status: SimulationStepStatus.OK, params, reject: false };
}

/**
 * Age rule: reject if car is older than SIMULATION_MAX_AGE_YEARS.
 */
export function applyAgeRule(firstRegisteredAt: Date): {
  code: SimulationStepCode;
  status: SimulationStepStatus;
  params: Record<string, string | number>;
  reject: boolean;
} {
  const params = { maxYears: SIMULATION_MAX_AGE_YEARS };
  const limitDate = addYears(firstRegisteredAt, SIMULATION_MAX_AGE_YEARS);
  if (isBefore(limitDate, new Date())) {
    return { code: SimulationStepCode.CAR_LIMIT, status: SimulationStepStatus.NOT_OK, params, reject: true };
  }
  return { code: SimulationStepCode.CAR_LIMIT, status: SimulationStepStatus.OK, params, reject: false };
}

export async function runSimulationEngine(input: SimulationRunInput): Promise<{ resultCode: SimulationResultCode; steps: SimulationStep[] }> {
  const steps: SimulationStep[] = [];

  const kmResult = applyKmRule(input.km);
  steps.push({
    code: kmResult.code,
    status: kmResult.status,
    message: await getMessage(`simulation.step.${kmResult.code}`, kmResult.params),
  });
  if (kmResult.reject) {
    return { resultCode: SimulationResultCode.NOT_OK, steps };
  }

  const ageResult = applyAgeRule(input.firstRegisteredAt);
  steps.push({
    code: ageResult.code,
    status: ageResult.status,
    message: await getMessage(`simulation.step.${ageResult.code}`, ageResult.params),
  });
  if (ageResult.reject) {
    return { resultCode: SimulationResultCode.NOT_OK, steps };
  }

  const priceRange = await carValueEstimator(input.brandId, input.carTypeId, input.carTypeOther, input.firstRegisteredAt);
  const priceMid = Math.round((priceRange.min + priceRange.max) / 2);
  const priceParams = { price: `${(priceMid / 1000).toFixed(0)}k` };
  steps.push({
    code: SimulationStepCode.PRICE_ESTIMATED,
    status: SimulationStepStatus.INFO,
    message: await getMessage(`simulation.step.${SimulationStepCode.PRICE_ESTIMATED}`, priceParams),
  });

  return { resultCode: SimulationResultCode.MANUAL_REVIEW, steps };
}
