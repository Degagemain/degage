import { SimulationStepCode, SimulationStepIcon } from '@/domain/simulation.model';
import type { SimulationResultBuilder } from '@/domain/simulation.model';
import { addInfoMessage, getSimulationMessage } from '@/actions/simulation/simulation-utils';
import { dbInsurancePriceBenchmarkFindMostRecent } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.read';
import { formatPriceInThousands } from '@/domain/utils';

/**
 * Calculates the estimated insurance cost for a car.
 * Uses the most recent benchmark for the given year where carValue < maxCarPrice.
 * Returns null rate if no applicable benchmark exists.
 * Rate formula: baseRate * carValue * rate
 */
export async function calculateCarInsurance(result: SimulationResultBuilder, carValue: number, pointInTime: Date): Promise<number | null> {
  const year = pointInTime.getFullYear();
  const benchmark = await dbInsurancePriceBenchmarkFindMostRecent(year, carValue);
  if (!benchmark) {
    throw new Error('No insurance price benchmark found for the given year and car value');
  }
  const fee = Math.round(benchmark.baseRate + carValue * benchmark.rate);
  addInfoMessage(
    result,
    await getSimulationMessage(SimulationStepCode.CAR_INSURANCE_ESTIMATED, {
      carValue: formatPriceInThousands(carValue),
      year,
      baseRate: benchmark.baseRate,
      rate: benchmark.rate,
      fee,
    }),
  );
  return fee;
}
