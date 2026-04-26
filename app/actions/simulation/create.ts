import { simulationRunInputParseSchema } from '@/domain/simulation.model';
import { dbSimulationCreate } from '@/storage/simulation/simulation.create';
import { runSimulationEngine } from './engine';
import type { Simulation, SimulationRunInput } from '@/domain/simulation.model';

function buildSimulationFromResult(
  validated: ReturnType<typeof simulationRunInputParseSchema.parse>,
  result: Awaited<ReturnType<typeof runSimulationEngine>>,
): Simulation {
  return {
    id: null,
    town: validated.town,
    brand: validated.brand,
    fuelType: validated.fuelType,
    carType: validated.carType,
    carTypeOther: validated.carTypeOther,
    mileage: validated.mileage,
    ownerKmPerYear: validated.ownerKmPerYear,
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
    resultMaintenanceCostPerYear: result.resultMaintenanceCostPerYear ?? null,
    resultBenchmarkMinKm: result.resultBenchmarkMinKm ?? null,
    resultBenchmarkAvgKm: result.resultBenchmarkAvgKm ?? null,
    resultBenchmarkMaxKm: result.resultBenchmarkMaxKm ?? null,
    resultRoundedKmCost: result.resultRoundedKmCost ?? null,
    resultDepreciationCostKm: result.resultDepreciationCostKm ?? null,
    resultEstimatedCarValue: result.resultEstimatedCarValue ?? null,
    error: result.error ?? null,
    duration: result.duration ?? 45,
    steps: result.steps,
    email: null,
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
