import { simulationRunInputParseSchema } from '@/domain/simulation.model';
import { dbSimulationCreate } from '@/storage/simulation/simulation.create';
import { runSimulationEngine } from './engine';
import type { Simulation, SimulationRunInput } from '@/domain/simulation.model';

export async function createSimulation(input: SimulationRunInput): Promise<Simulation> {
  const validated = simulationRunInputParseSchema.parse(input);
  const result = await runSimulationEngine(validated);

  const simulation: Simulation = {
    id: null,
    townId: validated.town.id,
    brandId: validated.brand.id,
    fuelTypeId: validated.fuelType.id,
    carTypeId: validated.carType?.id ?? null,
    carTypeOther: validated.carTypeOther,
    km: validated.km,
    firstRegisteredAt: validated.firstRegisteredAt,
    isVan: validated.isVan,
    resultCode: result.resultCode,
    estimatedPrice: null,
    steps: result.steps,
    createdAt: null,
    updatedAt: null,
  };

  return dbSimulationCreate(simulation);
}
