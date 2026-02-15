import { SimulationRegion } from '@/domain/simulation-region.model';
import { dbSimulationRegionRead } from '@/storage/simulation-region/simulation-region.read';

export const readSimulationRegion = async (id: string): Promise<SimulationRegion> => {
  return dbSimulationRegionRead(id);
};
