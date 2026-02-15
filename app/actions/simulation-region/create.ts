import { SimulationRegion, simulationRegionSchema } from '@/domain/simulation-region.model';
import { dbSimulationRegionCreate } from '@/storage/simulation-region/simulation-region.create';
import { dbSimulationRegionClearOtherDefaults } from '@/storage/simulation-region/clear-other-defaults';

export const createSimulationRegion = async (region: SimulationRegion): Promise<SimulationRegion> => {
  const validated = simulationRegionSchema.parse(region);
  const created = await dbSimulationRegionCreate(validated);
  if (created.isDefault) {
    await dbSimulationRegionClearOtherDefaults(created.id!);
  }
  return created;
};
