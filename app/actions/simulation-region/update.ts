import * as z from 'zod';
import { SimulationRegion, simulationRegionSchema } from '@/domain/simulation-region.model';
import { dbSimulationRegionUpdate } from '@/storage/simulation-region/simulation-region.update';
import { dbSimulationRegionClearOtherDefaults } from '@/storage/simulation-region/clear-other-defaults';

export const updateSimulationRegion = async (region: SimulationRegion): Promise<SimulationRegion> => {
  const validated = simulationRegionSchema.parse(region);
  z.uuid().parse(validated.id);
  const updated = await dbSimulationRegionUpdate(validated);
  if (updated.isDefault) {
    await dbSimulationRegionClearOtherDefaults(updated.id!);
  }
  return updated;
};
