import { dbSimulationRegionDelete } from '@/storage/simulation-region/simulation-region.delete';

export const deleteSimulationRegion = async (id: string): Promise<void> => {
  await dbSimulationRegionDelete(id);
};
