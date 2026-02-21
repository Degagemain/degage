import { format } from 'date-fns';

import { isEmpty } from '@/domain/utils';
import { isElectricFuelType } from '@/domain/fuel-type.model';
import type { SimulationStep } from '@/domain/simulation.model';
import { SimulationStepCode, SimulationStepStatus } from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';
import { dbFiscalRegionRead } from '@/storage/fiscal-region/fiscal-region.read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbCarTaxFlatRateFindByFiscalRegionAndRegistrationDate } from '@/storage/car-tax-flat-rate/car-tax-flat-rate.read';
import { dbCarTaxBaseRateFindByFiscalRegionDateAndCc } from '@/storage/car-tax-base-rate/car-tax-base-rate.read';
import { dbCarTaxEuroNormAdjustmentFindByFiscalRegionAndEuroNormGroup } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.read';
import { dbEuroNormRead } from '@/storage/euro-norm/euro-norm.read';

const TAX_CUTOFF_DATE = new Date(2016, 0, 1);
const CO2_RULE_DATE = new Date(2021, 0, 1);
const CO2_THRESHOLDS_AFTER_DATE = [25, 150, 500];
const CO2_THRESHOLDS_BEFORE_DATE = [25, 123, 500];
const CO2_FACTOR = 0.003;

const OPDECIEM = 0.1;

export interface CarTaxCalculatorInput {
  fiscalRegionId: string;
  fuelTypeId: string;
  firstRegistrationDate: Date;
  cc?: number;
  co2Emission?: number;
  euroNormId?: string;
}

export interface CarTaxCalculatorResult {
  rate: number;
  steps: SimulationStep[];
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

export async function calculateCarTax(input: CarTaxCalculatorInput): Promise<CarTaxCalculatorResult> {
  const steps: SimulationStep[] = [];
  const fiscalRegion = await dbFiscalRegionRead(input.fiscalRegionId);
  if (!fiscalRegion.isDefault) {
    throw new Error('Car tax calculation is only supported for the default fiscal region');
  }

  const fuelType = await dbFuelTypeRead(input.fuelTypeId);

  if (isElectricFuelType(fuelType)) {
    const flatRate = await dbCarTaxFlatRateFindByFiscalRegionAndRegistrationDate(input.fiscalRegionId, input.firstRegistrationDate);
    const rate = Math.round(flatRate?.rate ?? 0);
    const registrationDate = format(input.firstRegistrationDate, 'dd/MM/yyyy');
    steps.push({
      code: SimulationStepCode.CAR_TAX_ESTIMATED,
      status: SimulationStepStatus.INFO,
      message: await getMessage('simulation.step.car_tax_estimated_electric', { registrationDate, rate }),
    });
    return { rate, steps };
  }

  if (isEmpty(input.cc) || isEmpty(input.co2Emission) || isEmpty(input.euroNormId)) {
    throw new Error('cc, co2Emission and euroNormId are required for non-electric cars and must not be null, undefined or zero');
  }

  let baseRate = await dbCarTaxBaseRateFindByFiscalRegionDateAndCc(input.fiscalRegionId, input.firstRegistrationDate, input.cc);
  let extraPk = 0;
  if (!baseRate) {
    baseRate = await dbCarTaxBaseRateFindByFiscalRegionDateAndCc(input.fiscalRegionId, input.firstRegistrationDate);

    if (!baseRate || baseRate.maxCc > input.cc!) {
      throw new Error('No car tax base rate found for the given fiscal region, registration date and cc');
    }

    const extraCC = input.cc! - baseRate.maxCc;
    extraPk = Math.ceil(extraCC / 200);
  }

  let rate = Math.round(baseRate.rate + extraPk * 134);

  steps.push({
    code: SimulationStepCode.CAR_TAX_ESTIMATED,
    status: SimulationStepStatus.INFO,
    message: await getMessage(`simulation.step.${SimulationStepCode.CAR_TAX_ESTIMATED}`, { rate }),
  });

  if (input.firstRegistrationDate < TAX_CUTOFF_DATE) {
    rate *= 1 + OPDECIEM;
    return { rate, steps };
  }

  const { co2Diff } = calculateCo2Diff(input.firstRegistrationDate, input.co2Emission!, rate);

  steps.push({
    code: SimulationStepCode.CAR_TAX_ESTIMATED,
    status: SimulationStepStatus.INFO,
    message: await getMessage('simulation.step.car_tax_co2_adjustment', { diff: Math.round(co2Diff) }),
  });

  const euroNorm = await dbEuroNormRead(input.euroNormId!);
  const euroNormAdjustment = await dbCarTaxEuroNormAdjustmentFindByFiscalRegionAndEuroNormGroup(input.fiscalRegionId, euroNorm.group);
  if (!euroNormAdjustment) {
    throw new Error('No car tax euro norm adjustment found for the given fiscal region and euro norm group');
  }
  const adjustment = fuelType.code === 'diesel' ? euroNormAdjustment.dieselAdjustment : euroNormAdjustment.defaultAdjustment;
  const euroNormDiff = rate * adjustment;
  steps.push({
    code: SimulationStepCode.CAR_TAX_ESTIMATED,
    status: SimulationStepStatus.INFO,
    message: await getMessage('simulation.step.car_tax_euro_norm_adjustment', { adjustment: Math.round(euroNormDiff) }),
  });

  rate = Math.round(rate + co2Diff + euroNormDiff);

  return { rate, steps };
}
