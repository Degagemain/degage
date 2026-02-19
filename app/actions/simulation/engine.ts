import { addYears, isBefore } from 'date-fns';

import {
  SimulationResultCode,
  type SimulationRunInput,
  SimulationStep,
  SimulationStepCode,
  SimulationStepStatus,
} from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';
import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { type CarInfo, carInfoEstimator } from '@/actions/simulation/car-info-estimator';
import { getSimulationParams } from '@/actions/system-parameter/get-simulation-params';

/**
 * Km rule: reject if km > maxKm.
 * Returns the step (code, status, params) and whether to reject.
 */
export function applyKmRule(
  km: number,
  maxKm: number,
): {
  code: SimulationStepCode;
  status: SimulationStepStatus;
  params: Record<string, string | number>;
  reject: boolean;
} {
  const params = { maxKm };
  if (km > maxKm) {
    return { code: SimulationStepCode.KM_LIMIT, status: SimulationStepStatus.NOT_OK, params, reject: true };
  }
  return { code: SimulationStepCode.KM_LIMIT, status: SimulationStepStatus.OK, params, reject: false };
}

/**
 * Age rule: reject if car is older than maxAgeYears.
 */
export function applyAgeRule(
  firstRegisteredAt: Date,
  maxAgeYears: number,
): {
  code: SimulationStepCode;
  status: SimulationStepStatus;
  params: Record<string, string | number>;
  reject: boolean;
} {
  const params = { maxYears: maxAgeYears };
  const limitDate = addYears(firstRegisteredAt, maxAgeYears);
  if (isBefore(limitDate, new Date())) {
    return { code: SimulationStepCode.CAR_LIMIT, status: SimulationStepStatus.NOT_OK, params, reject: true };
  }
  return { code: SimulationStepCode.CAR_LIMIT, status: SimulationStepStatus.OK, params, reject: false };
}

export interface SimulationEngineResult {
  resultCode: SimulationResultCode;
  steps: SimulationStep[];
  carInfo: CarInfo | null;
}

export async function runSimulationEngine(input: SimulationRunInput): Promise<SimulationEngineResult> {
  const { maxAgeYears, maxKm } = await getSimulationParams();
  const steps: SimulationStep[] = [];

  const kmResult = applyKmRule(input.km, maxKm);
  steps.push({
    code: kmResult.code,
    status: kmResult.status,
    message: await getMessage(`simulation.step.${kmResult.code}`, kmResult.params),
  });
  if (kmResult.reject) {
    return { resultCode: SimulationResultCode.NOT_OK, steps, carInfo: null };
  }

  const ageResult = applyAgeRule(input.firstRegisteredAt, maxAgeYears);
  steps.push({
    code: ageResult.code,
    status: ageResult.status,
    message: await getMessage(`simulation.step.${ageResult.code}`, ageResult.params),
  });
  if (ageResult.reject) {
    return { resultCode: SimulationResultCode.NOT_OK, steps, carInfo: null };
  }

  try {
    const priceRange = await carValueEstimator(
      input.brand.id,
      input.fuelType.id,
      input.carType?.id ?? null,
      input.carTypeOther,
      input.firstRegisteredAt,
    );
    const priceParams = { price: `${(Math.round(priceRange.price) / 1000).toFixed(0)}k` };
    steps.push({
      code: SimulationStepCode.PRICE_ESTIMATED,
      status: SimulationStepStatus.INFO,
      message: await getMessage(`simulation.step.${SimulationStepCode.PRICE_ESTIMATED}`, priceParams),
    });
  } catch {
    steps.push({
      code: SimulationStepCode.PRICE_ESTIMATION_FAILED,
      status: SimulationStepStatus.WARNING,
      message: await getMessage(`simulation.step.${SimulationStepCode.PRICE_ESTIMATION_FAILED}`),
    });
    return { resultCode: SimulationResultCode.MANUAL_REVIEW, steps, carInfo: null };
  }

  let carInfo: CarInfo | null = null;
  const year = input.firstRegisteredAt.getFullYear();

  try {
    carInfo = await carInfoEstimator(input.brand.id, input.fuelType.id, input.carType?.id ?? null, input.carTypeOther, year);
    steps.push({
      code: SimulationStepCode.CAR_INFO_ESTIMATED,
      status: SimulationStepStatus.INFO,
      message: await getMessage(`simulation.step.${SimulationStepCode.CAR_INFO_ESTIMATED}`, {
        cylinderCc: carInfo.cylinderCc,
        co2: carInfo.co2Emission,
        ecoscore: carInfo.ecoscore,
        euroNorm: carInfo.euroNormCode ?? '—',
      }),
    });
  } catch {
    steps.push({
      code: SimulationStepCode.CAR_INFO_ESTIMATION_FAILED,
      status: SimulationStepStatus.WARNING,
      message: await getMessage(`simulation.step.${SimulationStepCode.CAR_INFO_ESTIMATION_FAILED}`),
    });
  }

  return { resultCode: SimulationResultCode.MANUAL_REVIEW, steps, carInfo };
}
