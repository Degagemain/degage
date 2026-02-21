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
    resultCode: result.resultCode,
    estimatedPrice: null,
    cylinderCc: result.carInfo?.cylinderCc ?? null,
    co2Emission: result.carInfo?.co2Emission ?? null,
    ecoscore: result.carInfo?.ecoscore ?? null,
    euroNormCode: result.carInfo?.euroNormCode ?? null,
    consumption: result.carInfo?.consumption ?? null,
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
