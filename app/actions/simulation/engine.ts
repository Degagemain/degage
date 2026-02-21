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
import { calculateCarInsurance } from '@/actions/simulation/car-insurance-calculator';
import { calculateCarTax } from '@/actions/simulation/car-tax-calculator';
import { getSimulationParams } from '@/actions/system-parameter/get-simulation-params';
import { isElectricFuelType } from '@/domain/fuel-type.model';
import { dbEuroNormFindByCode } from '@/storage/euro-norm/euro-norm.read';
import { dbHubRead } from '@/storage/hub/hub.read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbTownRead } from '@/storage/town/town.read';
import { dbProvinceRead } from '@/storage/province/province.read';
import { dbHubBenchmarkFindClosest } from '@/storage/hub-benchmark/hub-benchmark.read';

/**
 * Mileage rule: reject if mileage > maxMileage.
 * Returns the step (code, status, params) and whether to reject.
 */
export function applyMileageRule(
  mileage: number,
  maxMileage: number,
): {
  code: SimulationStepCode;
  status: SimulationStepStatus;
  params: Record<string, string | number>;
  reject: boolean;
} {
  const params = { maxMileage };
  if (mileage > maxMileage) {
    return { code: SimulationStepCode.MILEAGE_LIMIT, status: SimulationStepStatus.NOT_OK, params, reject: true };
  }
  return { code: SimulationStepCode.MILEAGE_LIMIT, status: SimulationStepStatus.OK, params, reject: false };
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

  const town = await dbTownRead(input.town.id);
  const hub = await dbHubRead(town.hub.id);

  const fuelType = await dbFuelTypeRead(input.fuelType.id);
  const depreciationKm = isElectricFuelType(fuelType) ? hub.simDepreciationKmElectric : hub.simDepreciationKm;
  const kmToDepreciation = Math.max(0, depreciationKm - input.mileage);

  const mileageResult = applyMileageRule(input.mileage, maxKm);
  steps.push({
    code: mileageResult.code,
    status: mileageResult.status,
    message: await getMessage(`simulation.step.${mileageResult.code}`, mileageResult.params),
  });
  if (mileageResult.reject) {
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

  let estimatedCarValue: number | null = null;
  try {
    const priceRange = await carValueEstimator(
      input.brand.id,
      input.fuelType.id,
      input.carType?.id ?? null,
      input.carTypeOther,
      input.firstRegisteredAt,
    );
    const percentageDepreciated = Math.min(input.mileage, depreciationKm) / depreciationKm;
    estimatedCarValue = priceRange.min + (priceRange.price - priceRange.min) * (1 - percentageDepreciated);

    const priceParams = { price: `${(Math.round(estimatedCarValue) / 1000).toFixed(0)}k` };
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

  const province = await dbProvinceRead(town.province.id);
  const euroNorm = carInfo?.euroNormCode != null ? await dbEuroNormFindByCode(carInfo.euroNormCode) : null;
  const taxResult = await calculateCarTax({
    fiscalRegionId: province.fiscalRegion.id,
    fuelTypeId: input.fuelType.id,
    firstRegistrationDate: input.firstRegisteredAt,
    cc: carInfo?.cylinderCc,
    co2Emission: carInfo?.co2Emission,
    euroNormId: euroNorm?.id ?? undefined,
  });
  steps.push(...taxResult.steps);

  const insuranceResult = await calculateCarInsurance({
    carValue: estimatedCarValue,
    pointInTime: new Date(),
  });
  steps.push(...insuranceResult.steps);

  const closestBenchmark = await dbHubBenchmarkFindClosest(hub.id!, input.ownerKmPerYear);
  if (!closestBenchmark) {
    throw new Error('No closest benchmark found');
  }
  const estimatedTotalYearlyMileage = input.ownerKmPerYear + (input.ownerKmPerYear / closestBenchmark.ownerKm) * closestBenchmark.sharedAvgKm;
  const fixedYearCost = hub.simInspectionCostPerYear + hub.simMaintenanceCostPerYear + insuranceResult.rate! + taxResult.rate!;

  const kmCost = fixedYearCost / estimatedTotalYearlyMileage + (kmToDepreciation > 0 ? estimatedCarValue / kmToDepreciation : 0);
  const roundedKmCost = Math.round(kmCost * 100) / 100;

  steps.push({
    code: SimulationStepCode.YEARLY_MILEAGE_ESTIMATE,
    status: SimulationStepStatus.INFO,
    message: await getMessage('simulation.step.km_rate_estimated', {
      estimated: roundedKmCost,
    }),
  });

  return { resultCode: SimulationResultCode.MANUAL_REVIEW, steps, carInfo };
}
