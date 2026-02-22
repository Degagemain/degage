import { addYears, isBefore } from 'date-fns';

import {
  SimulationPhase,
  SimulationResultCode,
  type SimulationEngineResult,
  type SimulationResultBuilder,
  type SimulationRunInput,
  SimulationStepCode,
  SimulationStepIcon,
} from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';
import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { carInfoEstimator } from '@/actions/simulation/car-info-estimator';
import { calculateCarInsurance } from '@/actions/simulation/car-insurance-calculator';
import { calculateCarTax } from '@/actions/simulation/car-tax-calculator';
import { addErrorMessage, addInfoMessage, addStep, getSimulationMessage, setCurrentStep } from '@/actions/simulation/simulation-utils';
import { getSimulationParams } from '@/actions/system-parameter/get-simulation-params';
import { formatPriceInThousands } from '@/domain/utils';
import { isElectricFuelType } from '@/domain/fuel-type.model';
import { dbEuroNormFindByCode } from '@/storage/euro-norm/euro-norm.read';
import { dbFiscalRegionRead } from '@/storage/fiscal-region/fiscal-region.read';
import { dbHubRead } from '@/storage/hub/hub.read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbTownRead } from '@/storage/town/town.read';
import { dbProvinceRead } from '@/storage/province/province.read';
import { dbHubBenchmarkFindClosest } from '@/storage/hub-benchmark/hub-benchmark.read';

export async function applyMileageRule(result: SimulationResultBuilder, mileage: number, maxMileage: number): Promise<boolean> {
  const passed = mileage <= maxMileage;
  const status = passed ? SimulationStepIcon.OK : SimulationStepIcon.NOT_OK;
  addStep(result, status, await getSimulationMessage(SimulationStepCode.MILEAGE_LIMIT, { maxMileage }));
  return passed;
}

export async function applyAgeRule(result: SimulationResultBuilder, firstRegisteredAt: Date, maxAgeYears: number): Promise<boolean> {
  const params = { maxYears: maxAgeYears };
  const limitDate = addYears(firstRegisteredAt, maxAgeYears);
  const passed = !isBefore(limitDate, new Date());
  const status = passed ? SimulationStepIcon.OK : SimulationStepIcon.NOT_OK;
  addStep(result, status, await getSimulationMessage(SimulationStepCode.CAR_LIMIT, params));
  return passed;
}

export async function runSimulationEngine(input: SimulationRunInput): Promise<SimulationEngineResult> {
  const { maxAgeYears, maxKm } = await getSimulationParams();
  const result: SimulationEngineResult = {
    resultCode: SimulationResultCode.MANUAL_REVIEW,
    steps: [],
    carInfo: null,
    currentStep: null,
  };

  try {
    setCurrentStep(result, SimulationPhase.INITIAL_CHECKS);
    const town = await dbTownRead(input.town.id);
    const hub = await dbHubRead(town.hub.id);

    const fuelType = await dbFuelTypeRead(input.fuelType.id);
    const depreciationKm = isElectricFuelType(fuelType) ? hub.simDepreciationKmElectric : hub.simDepreciationKm;
    const kmToDepreciation = Math.max(0, depreciationKm - input.mileage);

    if (!(await applyMileageRule(result, input.mileage, maxKm))) {
      result.resultCode = SimulationResultCode.NOT_OK;
      return result;
    }

    if (!(await applyAgeRule(result, input.firstRegisteredAt, maxAgeYears))) {
      result.resultCode = SimulationResultCode.NOT_OK;
      return result;
    }

    setCurrentStep(result, SimulationPhase.PRICE_ESTIMATION);
    const priceRange = await carValueEstimator(
      input.brand.id,
      fuelType,
      input.carType?.id ?? null,
      input.carTypeOther,
      input.firstRegisteredAt,
    );
    const percentageDepreciated = Math.min(input.mileage, depreciationKm) / depreciationKm;
    const estimatedCarValue = priceRange.min + (priceRange.price - priceRange.min) * (1 - percentageDepreciated);

    const priceParams = { price: formatPriceInThousands(estimatedCarValue) };
    addInfoMessage(result, await getSimulationMessage(SimulationStepCode.PRICE_ESTIMATED, priceParams));

    setCurrentStep(result, SimulationPhase.CAR_INFO);
    const year = input.firstRegisteredAt.getFullYear();
    const carInfo = await carInfoEstimator(input.brand.id, fuelType, input.carType?.id ?? null, input.carTypeOther, year);
    addInfoMessage(
      result,
      await getSimulationMessage(SimulationStepCode.CAR_INFO_ESTIMATED, {
        cylinderCc: carInfo.cylinderCc,
        co2: carInfo.co2Emission,
        ecoscore: carInfo.ecoscore,
        euroNorm: carInfo.euroNormCode ?? '—',
      }),
    );
    result.carInfo = carInfo;

    setCurrentStep(result, SimulationPhase.CAR_TAX);
    const province = await dbProvinceRead(town.province.id);
    const fiscalRegion = await dbFiscalRegionRead(province.fiscalRegion.id);
    const euroNorm = carInfo?.euroNormCode != null ? await dbEuroNormFindByCode(carInfo.euroNormCode) : null;
    const taxResult = await calculateCarTax(result, {
      fiscalRegion,
      fuelType,
      firstRegistrationDate: input.firstRegisteredAt,
      cc: carInfo?.cylinderCc,
      co2Emission: carInfo?.co2Emission,
      euroNorm,
    });

    setCurrentStep(result, SimulationPhase.CAR_INSURANCE);
    const insuranceResult = await calculateCarInsurance(result, estimatedCarValue, new Date());

    setCurrentStep(result, SimulationPhase.KM_RATE);
    const closestBenchmark = await dbHubBenchmarkFindClosest(hub.id!, input.ownerKmPerYear);
    if (!closestBenchmark) {
      throw new Error('No closest benchmark found');
    }
    const estimatedTotalYearlyMileage = input.ownerKmPerYear + (input.ownerKmPerYear / closestBenchmark.ownerKm) * closestBenchmark.sharedAvgKm;
    const fixedYearCost = hub.simInspectionCostPerYear + hub.simMaintenanceCostPerYear + insuranceResult! + taxResult.rate!;

    const kmCost = fixedYearCost / estimatedTotalYearlyMileage + (kmToDepreciation > 0 ? estimatedCarValue / kmToDepreciation : 0);
    const roundedKmCost = Math.round(kmCost * 100) / 100;

    addInfoMessage(result, await getSimulationMessage(SimulationStepCode.KM_RATE_ESTIMATED, { estimated: roundedKmCost }));

    return result;
  } catch {
    const stepKey = result.currentStep ?? SimulationPhase.UNKNOWN;
    const stepLabel = await getMessage(stepKey);
    const message = await getSimulationMessage(SimulationStepCode.ERROR_DURING_STEP, { step: stepLabel });
    addErrorMessage(result, message);
    result.resultCode = SimulationResultCode.MANUAL_REVIEW;
    return result;
  }
}
