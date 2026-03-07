import { simulationRunInputParseSchema } from '@/domain/simulation.model';
import { calculateOwnerKmPerYear } from '@/domain/utils';
import { dbSimulationCreate } from '@/storage/simulation/simulation.create';
import { runSimulationEngine } from './engine';
import type { Simulation, SimulationRunInput } from '@/domain/simulation.model';

function buildSimulationFromResult(
  validated: ReturnType<typeof simulationRunInputParseSchema.parse>,
  result: Awaited<ReturnType<typeof runSimulationEngine>>,
): Simulation {
  return {
    id: null,
    townId: validated.town.id,
    brandId: validated.brand.id,
    fuelTypeId: validated.fuelType.id,
    carTypeId: validated.carType?.id ?? null,
    carTypeOther: validated.carTypeOther,
    mileage: validated.mileage,
    ownerKmPerYear: calculateOwnerKmPerYear(validated.mileage, validated.firstRegisteredAt),
    seats: validated.seats,
    firstRegisteredAt: validated.firstRegisteredAt,
    isVan: validated.isVan,
    isNewCar: validated.isNewCar,
    purchasePrice: validated.purchasePrice ?? null,
    rejectionReason: result.rejectionReason ?? null,
    resultCode: result.resultCode,
    resultEuroNorm: result.resultEuroNorm ?? null,
    resultEcoScore: result.resultEcoScore ?? null,
    resultConsumption: result.resultConsumption ?? null,
    resultCc: result.resultCc ?? null,
    resultCo2: result.resultCo2 ?? null,
    resultInsuranceCostPerYear: result.resultInsuranceCostPerYear ?? null,
    resultTaxCostPerYear: result.resultTaxCostPerYear ?? null,
    resultInspectionCostPerYear: result.resultInspectionCostPerYear ?? null,
    resultBenchmarkMinKm: result.resultBenchmarkMinKm ?? null,
    resultBenchmarkAvgKm: result.resultBenchmarkAvgKm ?? null,
    resultBenchmarkMaxKm: result.resultBenchmarkMaxKm ?? null,
    steps: result.steps,
    createdAt: null,
    updatedAt: null,
  };
}

export async function createSimulation(input: SimulationRunInput, options?: { skipPersistence?: boolean }): Promise<Simulation> {
  const validated = simulationRunInputParseSchema.parse(input);
  const result = await runSimulationEngine(validated);
  const simulation = buildSimulationFromResult(validated, result);

  if (options?.skipPersistence) {
    return simulation;
  }

  return dbSimulationCreate(simulation);
}
