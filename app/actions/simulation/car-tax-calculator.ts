import { format } from 'date-fns';

import type { EuroNorm } from '@/domain/euro-norm.model';
import type { FiscalRegion } from '@/domain/fiscal-region.model';
import type { FuelType } from '@/domain/fuel-type.model';
import { isEmpty } from '@/domain/utils';
import { isElectricFuelType } from '@/domain/fuel-type.model';
import { SimulationStepCode, SimulationStepIcon } from '@/domain/simulation.model';
import type { SimulationResultBuilder } from '@/domain/simulation.model';
import { addStep, getSimulationMessage } from '@/actions/simulation/simulation-utils';
import { dbCarTaxFlatRateFindByFiscalRegionAndRegistrationDate } from '@/storage/car-tax-flat-rate/car-tax-flat-rate.read';
import { dbCarTaxBaseRateFindByFiscalRegionDateAndCc } from '@/storage/car-tax-base-rate/car-tax-base-rate.read';
// eslint-disable-next-line max-len -- long storage import path
import { dbCarTaxEuroNormAdjustmentFindByFiscalRegionAndEuroNormGroup } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.read';

const TAX_CUTOFF_DATE = new Date(2016, 0, 1);
const CO2_RULE_DATE = new Date(2021, 0, 1);
const CO2_THRESHOLDS_AFTER_DATE = [25, 150, 500];
const CO2_THRESHOLDS_BEFORE_DATE = [25, 123, 500];
const CO2_FACTOR = 0.003;

const OPDECIEM = 0.1;

export interface CarTaxCalculatorInput {
  fiscalRegion: FiscalRegion;
  fuelType: FuelType;
  firstRegistrationDate: Date;
  cc?: number;
  co2Emission?: number;
  euroNorm?: EuroNorm | null;
}

export interface CarTaxCalculatorResult {
  rate: number;
}

export interface CalculateCo2DiffResult {
  co2Diff: number;
  co2Factor: number;
  diff: number;
  co2Range: [number, number, number];
}

export function calculateCo2Diff(firstRegistrationDate: Date, co2Emission: number, rate: number): CalculateCo2DiffResult {
  const co2Range = (firstRegistrationDate < CO2_RULE_DATE ? CO2_THRESHOLDS_BEFORE_DATE : CO2_THRESHOLDS_AFTER_DATE) as [number, number, number];
  const diff = co2Emission >= co2Range[1] ? Math.max(0, co2Range[2] - co2Emission) : co2Emission <= co2Range[0] ? 0 : co2Emission - co2Range[0];
  const co2Factor = diff * CO2_FACTOR;
  const co2Diff = rate * (co2Emission >= co2Range[1] ? co2Factor : -co2Factor);
  return { co2Diff, co2Factor, diff, co2Range };
}

export async function calculateCarTax(result: SimulationResultBuilder, input: CarTaxCalculatorInput): Promise<CarTaxCalculatorResult> {
  const { fiscalRegion, fuelType } = input;
  if (!fiscalRegion.isDefault) {
    throw new Error('Car tax calculation is only supported for the default fiscal region');
  }

  if (isElectricFuelType(fuelType)) {
    const flatRate = await dbCarTaxFlatRateFindByFiscalRegionAndRegistrationDate(fiscalRegion.id!, input.firstRegistrationDate);
    const rate = Math.round(flatRate?.rate ?? 0);
    const registrationDate = format(input.firstRegistrationDate, 'dd/MM/yyyy');
    addStep(result, SimulationStepIcon.INFO, await getSimulationMessage(SimulationStepCode.CAR_TAX_ESTIMATED_ELECTRIC, { registrationDate, rate }));
    return { rate };
  }

  if (isEmpty(input.cc) || isEmpty(input.co2Emission) || input.euroNorm == null) {
    throw new Error('cc, co2Emission and euroNorm are required for non-electric cars');
  }

  const euroNorm = input.euroNorm;

  let baseRate = await dbCarTaxBaseRateFindByFiscalRegionDateAndCc(fiscalRegion.id!, input.firstRegistrationDate, input.cc);
  let extraPk = 0;
  if (!baseRate) {
    baseRate = await dbCarTaxBaseRateFindByFiscalRegionDateAndCc(fiscalRegion.id!, input.firstRegistrationDate);

    if (!baseRate || baseRate.maxCc > input.cc!) {
      throw new Error('No car tax base rate found for the given fiscal region, registration date and cc');
    }

    const extraCC = input.cc! - baseRate.maxCc;
    extraPk = Math.ceil(extraCC / 200);
  }

  let rate = Math.round(baseRate.rate + extraPk * 134);

  addStep(result, SimulationStepIcon.INFO, await getSimulationMessage(SimulationStepCode.CAR_TAX_ESTIMATED, { rate }));

  if (input.firstRegistrationDate < TAX_CUTOFF_DATE) {
    rate *= 1 + OPDECIEM;
    return { rate };
  }

  const { co2Diff } = calculateCo2Diff(input.firstRegistrationDate, input.co2Emission!, rate);

  addStep(result, SimulationStepIcon.INFO, await getSimulationMessage(SimulationStepCode.CAR_TAX_CO2_ADJUSTMENT, { diff: Math.round(co2Diff) }));

  const euroNormAdjustment = await dbCarTaxEuroNormAdjustmentFindByFiscalRegionAndEuroNormGroup(fiscalRegion.id!, euroNorm.group);
  if (!euroNormAdjustment) {
    throw new Error('No car tax euro norm adjustment found for the given fiscal region and euro norm group');
  }
  const adjustment = fuelType.code === 'diesel' ? euroNormAdjustment.dieselAdjustment : euroNormAdjustment.defaultAdjustment;
  const euroNormDiff = rate * adjustment;
  addStep(result, SimulationStepIcon.INFO, await getSimulationMessage(SimulationStepCode.CAR_TAX_EURO_NORM_ADJUSTMENT, { adjustment: Math.round(euroNormDiff) }));

  rate = Math.round(rate + co2Diff + euroNormDiff);

  return { rate };
}
