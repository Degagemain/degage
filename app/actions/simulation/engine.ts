import { addYears, isBefore } from 'date-fns';

import {
  type SimulationEngineResult,
  SimulationPhase,
  type SimulationResultBuilder,
  SimulationResultCode,
  type SimulationRunInput,
  SimulationStepCode,
  SimulationStepIcon,
} from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';
import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { carInfoEstimator } from '@/actions/simulation/car-info-estimator';
import { calculateCarInsurance } from '@/actions/simulation/car-insurance-calculator';
import { calculateCarTax } from '@/actions/simulation/car-tax-calculator';
import {
  addErrorMessage,
  addInfoMessage,
  addStep,
  addSuccessMessage,
  getSimulationMessage,
  setCurrentStep,
} from '@/actions/simulation/simulation-utils';
import { formatPriceInThousands } from '@/domain/utils';
import { isElectricFuelType } from '@/domain/fuel-type.model';
import { dbEuroNormFindByCode } from '@/storage/euro-norm/euro-norm.read';
import { dbFiscalRegionRead } from '@/storage/fiscal-region/fiscal-region.read';
import { dbHubRead } from '@/storage/hub/hub.read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbTownRead } from '@/storage/town/town.read';
import { dbProvinceRead } from '@/storage/province/province.read';
import { dbHubBenchmarkFindClosest } from '@/storage/hub-benchmark/hub-benchmark.read';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';

export async function passesMileageRule(result: SimulationResultBuilder, mileage: number, maxMileage: number): Promise<boolean> {
  const passed = mileage <= maxMileage;
  const status = passed ? SimulationStepIcon.OK : SimulationStepIcon.NOT_OK;
  addStep(result, status, await getSimulationMessage(SimulationStepCode.MILEAGE_LIMIT, { maxMileage }));
  return passed;
}

export async function passesAgeRule(result: SimulationResultBuilder, firstRegisteredAt: Date, maxAgeYears: number): Promise<boolean> {
  const params = { maxYears: maxAgeYears };
  const limitDate = addYears(firstRegisteredAt, maxAgeYears);
  const passed = !isBefore(limitDate, new Date());
  const status = passed ? SimulationStepIcon.OK : SimulationStepIcon.NOT_OK;
  addStep(result, status, await getSimulationMessage(SimulationStepCode.CAR_LIMIT, params));
  return passed;
}

export async function runSimulationEngine(input: SimulationRunInput): Promise<SimulationEngineResult> {
  const result: SimulationEngineResult = {
    resultCode: SimulationResultCode.MANUAL_REVIEW,
    steps: [],
    carInfo: null,
    currentStep: null,
  };
  try {
    return await tryRunSimulationEngine(input, result);
  } catch {
    const stepKey = result.currentStep ?? SimulationPhase.UNKNOWN;
    const stepLabel = await getMessage(stepKey);
    const message = await getSimulationMessage(SimulationStepCode.ERROR_DURING_STEP, { step: stepLabel });
    addErrorMessage(result, message);
    result.resultCode = SimulationResultCode.MANUAL_REVIEW;
    return result;
  }
}

export async function tryRunSimulationEngine(input: SimulationRunInput, result: SimulationEngineResult): Promise<SimulationEngineResult> {
  setCurrentStep(result, SimulationPhase.INITIAL_CHECKS);
  const town = await dbTownRead(input.town.id);
  const hub = await dbHubRead(town.hub.id);
  const maxAgeYears = hub.simMaxAge;
  const maxKm = hub.simMaxKm;

  const fuelType = await dbFuelTypeRead(input.fuelType.id);
  const depreciationKm = isElectricFuelType(fuelType) ? hub.simDepreciationKmElectric : hub.simDepreciationKm;
  const kmToDepreciation = Math.max(0, depreciationKm - input.mileage);

  if (!(await passesMileageRule(result, input.mileage, maxKm))) {
    result.resultCode = SimulationResultCode.NOT_OK;
    result.rejectionReason = await getSimulationMessage(SimulationStepCode.MILEAGE_LIMIT, { maxMileage: input.mileage });
    return result;
  }

  if (!(await passesAgeRule(result, input.firstRegisteredAt, maxAgeYears))) {
    result.resultCode = SimulationResultCode.NOT_OK;
    result.rejectionReason = await getSimulationMessage(SimulationStepCode.CAR_LIMIT, { maxYears: maxAgeYears });
    return result;
  }

  setCurrentStep(result, SimulationPhase.PRICE_ESTIMATION);
  const priceRange = await carValueEstimator(input.brand.id, fuelType, input.carType?.id ?? null, input.carTypeOther, input.firstRegisteredAt);
  const percentageDepreciated = Math.min(input.mileage, depreciationKm) / depreciationKm;
  const estimatedCarValue = priceRange.min + (priceRange.price - priceRange.min) * (1 - percentageDepreciated);

  const priceParams = { price: formatPriceInThousands(estimatedCarValue) };
  addInfoMessage(result, await getSimulationMessage(SimulationStepCode.PRICE_ESTIMATED, priceParams));

  setCurrentStep(result, SimulationPhase.CAR_INFO);
  const estimatedBuildYear = input.firstRegisteredAt.getFullYear();
  const carInfo = await carInfoEstimator(input.brand.id, fuelType, input.carType?.id ?? null, input.carTypeOther, estimatedBuildYear);
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
  const insurancePrice = await calculateCarInsurance(result, estimatedCarValue, new Date());

  setCurrentStep(result, SimulationPhase.KM_RATE);
  const closestBenchmark = await dbHubBenchmarkFindClosest(hub.id!, input.ownerKmPerYear);
  if (!closestBenchmark) {
    throw new Error('No closest benchmark found');
  }
  const estimatedTotalYearlyMileage = input.ownerKmPerYear + (input.ownerKmPerYear / closestBenchmark.ownerKm) * closestBenchmark.sharedAvgKm;
  const fixedYearCost = hub.simInspectionCostPerYear + hub.simMaintenanceCostPerYear + insurancePrice! + taxResult.rate!;

  const fuelCostPerKm = (fuelType.pricePer * carInfo.consumption) / 100;
  addInfoMessage(
    result,
    await getSimulationMessage(SimulationStepCode.FUEL_COST_PER_KM, { fuelCostPerKm: Math.round(fuelCostPerKm * 100) / 100 }),
  );

  const depreciationCostKm = kmToDepreciation > 0 ? estimatedCarValue / kmToDepreciation : 0;

  addInfoMessage(
    result,
    await getSimulationMessage(SimulationStepCode.DEPRECIATION_COST_PER_KM, {
      depreciationCostPerKm: Math.round(depreciationCostKm * 100) / 100,
    }),
  );

  const kmCost = fuelCostPerKm + fixedYearCost / estimatedTotalYearlyMileage + depreciationCostKm;
  const roundedKmCost = Math.round(kmCost * 100) / 100;
  addInfoMessage(result, await getSimulationMessage(SimulationStepCode.KM_RATE_ESTIMATED, { estimated: roundedKmCost }));

  // Quality criteria:
  let bonusPoints = 0;
  const carType = input.carType?.id ? await dbCarTypeRead(input.carType.id) : null;
  const ecoScore = carType?.ecoscore ?? carInfo.ecoscore;
  if (ecoScore >= hub.simMinEcoScoreForBonus) {
    bonusPoints += 1;
    addSuccessMessage(result, await getSimulationMessage(SimulationStepCode.ECO_SCORE_BONUS, { ecoScore }));
  }

  if (input.mileage <= hub.simMaxKmForBonus) {
    bonusPoints += 1;
    addSuccessMessage(result, await getSimulationMessage(SimulationStepCode.MILEAGE_BONUS, { mileage: input.mileage }));
  }

  const age = new Date().getFullYear() - estimatedBuildYear;
  if (age <= hub.simMaxAgeForBonus) {
    bonusPoints += 1;
    addSuccessMessage(result, await getSimulationMessage(SimulationStepCode.BUILD_YEAR_BONUS, { buildYear: estimatedBuildYear }));
  }

  // Extra Bonus Rules
  if (bonusPoints < 2) {
    const bonusPointsBefore = bonusPoints;
    if (ecoScore > 68) {
      bonusPoints += 1;
    } else if (ecoScore < 58) {
      bonusPoints -= 1;
    }
    if (input.mileage < 100_000) {
      bonusPoints += 1;
    } else if (input.mileage > 160_000) {
      bonusPoints -= 1;
    }
    if (age < 5) {
      bonusPoints += 1;
    } else if (age > 10) {
      bonusPoints -= 1;
    }
    if (town.highDemand) {
      bonusPoints += 1;
    }
    if (bonusPoints !== bonusPointsBefore) {
      addSuccessMessage(result, await getSimulationMessage(SimulationStepCode.EXTRA_BONUS_POINTS, { bonusPoints }));
    }
  }

  if (bonusPoints < 2) {
    result.resultCode = SimulationResultCode.NOT_OK;
    result.rejectionReason = await getSimulationMessage(SimulationStepCode.QUALITY_CRITERIA_NOT_MET);
    return result;
  }

  // Todo: system parameters  (also below)
  // First round of acceptances based of quality criteria
  if (roundedKmCost <= 0.38 && input.seats < 7) {
    result.resultCode = SimulationResultCode.CATEGORY_A;
    return result;
  } else if (input.seats >= 7 && roundedKmCost <= 0.46) {
    result.resultCode = SimulationResultCode.CATEGORY_B;
    return result;
  } else if (input.isVan) {
    result.resultCode = SimulationResultCode.HIGHER_RATE;
    return result;
  }

  if (hub.isDefault) {
    if (depreciationCostKm <= 0.32) {
      result.resultCode = SimulationResultCode.CATEGORY_A;
      return result;
    }
  }

  if (isElectricFuelType(fuelType)) {
    if (depreciationCostKm <= 0.33) {
      result.resultCode = SimulationResultCode.CATEGORY_A;
      return result;
    }
  }

  result.resultCode = SimulationResultCode.NOT_OK;
  result.rejectionReason = await getSimulationMessage(SimulationStepCode.PRICE_CRITERIA_NOT_MET);

  return result;
}
