import type { SimulationStep } from '@/domain/simulation.model';
import { SimulationStepCode, SimulationStepStatus } from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';
import { dbInsurancePriceBenchmarkFindMostRecentByYearAndCarPriceBelowMax } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.read';

export interface CarInsuranceCalculatorInput {
  carValue: number;
  pointInTime: Date;
}

export interface CarInsuranceCalculatorResult {
  rate: number | null;
  steps: SimulationStep[];
}

/**
 * Calculates the estimated insurance cost for a car.
 * Uses the most recent benchmark for the given year where carValue < maxCarPrice.
 * Returns null rate if no applicable benchmark exists.
 * Rate formula: baseRate * carValue * rate
 */
export async function calculateCarInsurance(input: CarInsuranceCalculatorInput): Promise<CarInsuranceCalculatorResult> {
  const steps: SimulationStep[] = [];
  const year = input.pointInTime.getFullYear();
  const benchmark = await dbInsurancePriceBenchmarkFindMostRecentByYearAndCarPriceBelowMax(year, input.carValue);
  if (!benchmark) {
    throw new Error('No insurance price benchmark found for the given year and car value');
  }
  const fee = Math.round(benchmark.baseRate + input.carValue * benchmark.rate);
  steps.push({
    code: SimulationStepCode.CAR_INSURANCE_ESTIMATED,
    status: SimulationStepStatus.INFO,
    message: await getMessage(`simulation.step.${SimulationStepCode.CAR_INSURANCE_ESTIMATED}`, {
      carValue: input.carValue,
      year,
      baseRate: benchmark.baseRate,
      rate: benchmark.rate,
      fee,
    }),
  });
  return { rate: fee, steps };
}
